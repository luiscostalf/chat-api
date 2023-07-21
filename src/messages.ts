import * as ajv from 'ajv';
import { ObjectId } from 'mongodb';
//import { getLogger } from './logging';
//const LOGGER = getLogger('MetricsServer');
const Ajv = ajv as unknown as typeof ajv.default;
export interface ChatMessage {
    _id?: ObjectId;
    visitorID: string;
    allInfoVisitor: any;
    sender: string;
    timestamp: string;
    nickname?: string;
    message: string;
    viewed: 'SENT' | 'RECEIVED' | 'VIEWED';
    emotions: {
        neutral: number,
        approval: number,
        annoyance: number,
        realization: number,
        admiration: number,
        disapproval: number,
        disappointment: number,
        confusion: number,
        anger: number,
        excitement: number,
        curiosity: number,
        disgust: number,
        joy: number,
        sadness: number,
        amusement: number,
        optimism: number,
        love: number,
        fear: number,
        gratitude: number,
        caring: number,
        desire: number,
        surprise: number,
        embarrassment: number,
        grief: number,
        pride: number,
        relief: number,
        nervousness: number,
        remorse: number
    },
    irony: {
        non_irony: number,
        irony: number
    },
    sentiment: {
        negative: number,
        netural: number,
        positive: number
    },
    type: 'human' | 'bot'
}


export class ChatMessage {
    private static validator = new Ajv().compile({
        type: 'object',
        properties: {
            id: { type: 'string' },
            allInfoVisitor: { type: 'object' },
            visitorID: { type: 'string' },
            sender: { type: 'string' },
            timestamp: { type: 'string' },
            nickname: { type: 'string' },
            message: { type: 'string' }
        },

        required: ['sender', 'timestamp', 'message', 'visitorID']
    });
    static validate(message: ChatMessage) {
        if (!ChatMessage.validator(message)) {
            console.dir(ChatMessage.validator.errors, { depth: null });
            throw new Error(`validation failed: ${ChatMessage.validator.errors.map(err => `${err.data}:${err.message}`).join('|')}`);
        }
    }
}

export interface Response {
    id: string;
    ok: boolean;
    error?: string;
}

