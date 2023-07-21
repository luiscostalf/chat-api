import { Store } from "../store";
import * as express from 'express';
import { IConfig } from '../../config';
import { getLogger } from "../../logging";

const LOGGER = getLogger('ChatSocketServer');

export function buildRouter(store: Store,config: IConfig): express.Router {
    const router = express.Router();
    // sessions ids
    router.post('/all-messages', async (req, res, error) => {
        try {
            res.json(await store.getAllMessages(req.body.visitorID,req.body.user));
        } catch (error) {
            LOGGER.error(error);
            //Change response if you don't want to specify the error
            res.status(500).send(error);
        }
    });
    router.post('/all-bot-messages', async (req, res, error) => {
        try {
            res.json(await store.getBotMessages(req.body.visitorID,req.body.user));
        } catch (error) {
            LOGGER.error(error);
            //Change response if you don't want to specify the error
            res.status(500).send(error);
        }
    });
    router.get('/all-chats', async (req, res, error) => {
        try {
            res.json(await store.getAllChats());
        } catch (error) {
            LOGGER.error(error);
            //Change response if you don't want to specify the error
            res.status(500).send(error);
        }
    });

    router.post('/is-superuser', async (req, res, error) => {
        let password = req.body.password
        let superuserPassword = config.superuserPassword;
        if(password && password === superuserPassword) {    
            res.json({result: true});
        } else {
            res.json({result: false});
        }
        try {
            
        } catch (error) {
            LOGGER.error(error);
            //Change response if you don't want to specify the error
            res.status(500).send(error);
        }
    });
    return router;
}