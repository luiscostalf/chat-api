export interface IMongoConfig {
    host: string;
    dbName: string;
    username: string;
    password: string;
}

export interface ILoggingConfig {
    level: string;
}


export interface IConfig {
    mongo: IMongoConfig;
    logging: ILoggingConfig;
    port: number;
    superuserPassword: string
}

export function loadConfig(): IConfig {

    let ENV = (process.env['env'] || 'dev').toLowerCase();

    if (['staging', 'prod', 'dev', 'test_prod'].indexOf(ENV) == -1) {
        ENV = 'dev';
    }
    let config = <IConfig>require(`./${ENV}`).Config;

    return config;
}