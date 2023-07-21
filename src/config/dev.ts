import { IConfig } from './index';

export const Config: IConfig = {
    mongo: {
        host: 'mongodb:27017',            
        dbName: 'chat',
        username: 'luis',
        password: 'password'
    },
    logging: {
        level: 'debug'
    },
    superuserPassword: 'password',
    port: 8080
}

