import { ChatMessage } from "../../messages";

export interface Store {
    getAllMessages(visitorID,user): Promise<ChatMessage[]>;
    getBotMessages(visitorID,user): Promise<ChatMessage[]>;
    getAllChats(): Promise<void>;

}
