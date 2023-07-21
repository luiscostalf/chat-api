import { ChatMessage } from '../../messages';
import { Mongo } from '../../mongo';
import * as Models from './models';
export class Store implements Models.Store {


    constructor(
        private mongoClient: Mongo,
    ) { }
    
    async getAllMessages(visitorID,user): Promise<ChatMessage[]> {
        return await this.mongoClient.getAllMessages(visitorID,user);
    }
    async getBotMessages(visitorID,user): Promise<ChatMessage[]> {
        return await this.mongoClient.getAllBotMessages(visitorID,user);
    }
    async getAllChats(): Promise<any> {
        return await this.mongoClient.getAllChats();
    }
}