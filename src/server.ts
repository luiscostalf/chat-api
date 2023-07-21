import * as SocketIO from "socket.io";
import * as express from "express";
import * as http from "http";
import { loadConfig, IConfig } from './config';
import { Mongo } from "./mongo";
import { getLogger } from "./logging";
import { ChatMessage } from "./messages";
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import * as MongoRouter from "./mongo/";
import { Store } from "./mongo/store/store";
import * as expressWinston from 'express-winston'
import * as winston from 'winston'
import axios from "axios";
import * as moment from "moment"

const LOGGER = getLogger('ChatSocketServer');

export class SocketChatServer {
    private isRunning = false;
    private io: SocketIO.Server;
    private http: http.Server;
    private config: IConfig;
    private mongoServer: Mongo;

    constructor() {
        // Empty constructor
    }

    // Start the chat server
    async start(): Promise<void> {
        if (this.isRunning) {
            LOGGER.info("server is already running.")
            return;
        }
        // Load configuration
        LOGGER.info('loading config...');
        this.config = loadConfig();
        
        LOGGER.info(JSON.stringify(this.config, null, 4));

        // Create Express application
        let expressApp = express();
        expressApp.use(cors());
        expressApp.use(bodyParser.json());

        // Configure logging middleware
        expressApp.use(expressWinston.logger({
            transports: [
                new winston.transports.Console()
            ],
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.json()
            ),
            meta: false,
            msg: "HTTP {{req.method}} {{req.url}}",
            expressFormat: true,
            colorize: true,
            ignoreRoute: function (req, res) { return false; }
        }));

        // Define routes for health check and MongoDB operations
        expressApp.get('/', function (req, res, next) {
            next();
            res.status(200);
        });

        expressApp.get('/health', async function (req, res) {
            res.json({status: 'I am alive'});
            return res.end();
        });

        // Create HTTP server and configure Socket.IO
        this.http = http.createServer(expressApp);
        this.io = new SocketIO.Server(this.http, {
            cors: {
                origin: "*"
            }
        });
        expressApp.set('socketio', this.io);


        // Connect to MongoDB
        this.mongoServer = new Mongo(this.config.mongo);
        await this.mongoServer.connect();
        
        // Configure routes and 
        await this.routesConfig(expressApp,this.config);
        // Configure socket events
        this.socketConfig(this.io, this.config);

        // Listen for incoming connections
        await this.listen();
        LOGGER.info(`server is running... on ${this.config.port}`);
        this.isRunning = true;
    }

    async routesConfig(expressApp: express.Application, config: IConfig) {
        let mongoStore = new Store(this.mongoServer)
        let router = MongoRouter.buildRouter(mongoStore,config);
        expressApp.use('/mongo', router);
    }


    socketConfig(io: SocketIO.Server, config: IConfig) {
        io.on("upgrade", (socket) => {
            LOGGER.debug(`${socket.id}SOCKET UPGRADE`);
        })

        io.on("connection", async (socket) => {
            //Join new user to message room
            socket.join('message')
            //Listen to "chat message" room for new messages
            socket.on("chat message", async (data: any) => {

                this.saveAndProcessMessage(socket, data)
            });
            socket.on("bot-message", async (data: any) => {

                this.botData(socket, data)
            });
        });
    }

    // Handle incoming bot messages
    async botData(socket: SocketIO.Socket, data: any) {
        let message: ChatMessage;

        try {
            //Parse and validate message
            message = <ChatMessage>JSON.parse(JSON.stringify(data));
            ChatMessage.validate(message);
            //Save message received
            message.type = 'bot'
            message.viewed = 'RECEIVED'
            this.sendToMongo(message)

            //Joining user to response room
            socket.join('bot-message')

            //Get response from bot
            //Timeout is increased to allow the model to process the response
            axios.post('http://emotions:80/api/get-bot', { "message": message.message }, { timeout: 600000 }).then(response => {
                if (message.visitorID) {
                    //Change message to the bot response
                    message.message = response.data.message
                    //Superuser is used as the response sender
                    message.sender = 'superuser'
                    message.viewed = 'RECEIVED'
                    message.timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSSSS')

                    //Emit data to the user only
                    this.io.to(socket.id).emit('bot-message', message)

                    //Delete _id since we recycle the message received from the user
                    delete message._id
                    message._id = null

                    this.sendToMongo(message)

                } else {
                    return;
                }
            }).catch(err => {
                
                //If bot timeout or something happen
                //Normally an error accures is RAM problem with the AI part
                message.message = "Bot won't answer that"
                message.sender = 'superuser'
                message.viewed = 'RECEIVED'
                message.timestamp = moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss.SSSSS')
                socket.join('bot-message')
                this.io.to(socket.id).emit('bot-message', message)
                delete message._id
                message._id = null
                LOGGER.warn(err)
                this.sendToMongo(message)
            })


        } catch (ex) {
            LOGGER.debug(`Failed to process message: ${data}: ${ex}`);
        }
    }

    async saveAndProcessMessage(socket: SocketIO.Socket, data: any) {
        let message: ChatMessage;

        try {
            //Parse and validate message
            message = <ChatMessage>JSON.parse(JSON.stringify(data));
            ChatMessage.validate(message);

            //Calls to sentiment API
            let emotions = () => axios.post('http://emotions:80/api/get-emotions', { "message": message.message })
            let irony = () => axios.post('http://emotions:80/api/get-irony', { "message": message.message })
            let sentiment = () => axios.post('http://emotions:80/api/get-sentiment', { "message": message.message })
            let result = await Promise.all([emotions(), irony(), sentiment()])
                .then(function (results) {
                    message.emotions = results[0].data;
                    message.irony = results[1].data;
                    message.sentiment = results[2].data;

                    return message;

                });

            if (message.visitorID) {
                //Joining user to his own room
                socket.join(message.visitorID)

                //sending to all clients except sender
                socket.broadcast.to(message.visitorID).emit('message', message);
                message.viewed = 'RECEIVED'

                //Emit response to user only as callback
                this.io.to(socket.id).emit('response', message)
                //To distinguish from chatbot interactions
                message.type = 'human'
                //Send message to be saved on mongo
                this.sendToMongo(result)

            } else {
                return;
            }

        } catch (ex) {
            LOGGER.debug(`Failed to process message: ${data}: ${ex}`);
        }
    }

    async sendToMongo(message) {
        await this.mongoServer.saveData(message)

    }

    // Start listening for incoming connections
    async listen() {
        return new Promise((res, rej) => {
            this.http.listen(this.config.port, () => {
                return res(true);
            }).on('error', (err) => {
                return rej(err)
            });
        });
    }
    // Close the chat server
    async close(): Promise<void> {
        // close socket
        await new Promise((res, rej) => {
            LOGGER.info("closing socket.io...")
            this.io.close(() => {
                LOGGER.info("socket.io closed.");
                res(true);
            });
        });
        // Close MongoDB and exit the process
        LOGGER.info("closing mongo client...")
        LOGGER.info("mongo closed.")
        process.exit();
    }

}