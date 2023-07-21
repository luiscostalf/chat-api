import { getLogger } from "./logging";
import { Db, MongoClient } from "mongodb";
import { IMongoConfig } from "./config";
import { ChatMessage } from "./messages";

const LOGGER = getLogger('MongoServer');

export class Mongo {

    private client: MongoClient;
    private db: Db;

    constructor(
        private config: IMongoConfig
    ) { }

    connect(): Promise<any> {
        return new Promise(async (res, rej) => {
            try {
                
                const url = `mongodb://${this.config.username}:${this.config.password}@${this.config.host}`;
                this.client = new MongoClient(url, {
                    connectTimeoutMS: 10000, maxPoolSize: 10, // Maintain up to 10 socket connections
                    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                    family: 4
                });
                
                try {
                    LOGGER.info("connecting to Mongo...");
                    await this.client.connect().catch(err => LOGGER.error(err))
                    LOGGER.info(`Connected to Mongo!`);
                    LOGGER.info("connecting to DB...",);
                    this.db = this.client.db(this.config.dbName);
                    LOGGER.info("Connected to DB...",);

                } catch (e) {
                    console.error(e, e.stack);
                }
                res(true);
            } catch (err) {
                LOGGER.error(err);
                rej(err);
            }           
        });
    }

    //Save message data
    saveData(data: ChatMessage): Promise<any> {
        //Based on the visitorID save chat data
        let visitorCollection = this.db.collection(data.visitorID);
        return new Promise((res, rej) => {
            try {
                visitorCollection.insertOne(data)
                res(true);
            } catch (e) {
                LOGGER.error(e);
                rej(e)
            }


        })
    }
    //Get all messages based
    //Only interations with the user
    async getAllMessages(visitorID: string, user: string): Promise<ChatMessage[]> {
        let visitorCollection = this.db.collection(visitorID)
        //Set messages to "VIEWED" depending of who viwed 
        if(user === 'superuser') {
            await visitorCollection.updateMany({sender: 'user'},{$set:{viewed: 'VIEWED'}})
        } else {
            await visitorCollection.updateMany({sender: 'superuser'},{$set:{viewed: 'VIEWED'}})
        }
        
        return <ChatMessage[]>await visitorCollection.find({type: 'human'}).toArray()
    }
    //Get all messages based on
    //Only interations with the bot
    async getAllBotMessages(visitorID: string, user: string): Promise<ChatMessage[]> {
        let visitorCollection = this.db.collection(visitorID)
        //Set messages to "VIEWED" depending of who viwed 
        if(user === 'superuser') {
            await visitorCollection.updateMany({sender: 'user'},{$set:{viewed: 'VIEWED'}})
        } else {
            await visitorCollection.updateMany({sender: 'superuser'},{$set:{viewed: 'VIEWED'}})
        }
        
        return <ChatMessage[]>await visitorCollection.find({type: 'bot'}).toArray()
    }

    //Super user sees all collections(chats) available
    async getAllChats() {
        return (await this.db.listCollections().toArray()).map(collection => collection.name);
    }




}