import { loadConfig } from './config';

export interface ILogger {
    level: string;
    info(msg: string);
    debug(msg: string)
    warn(msg: string)
    error(msg: string)
}

class Logger implements ILogger {

    private levels = {
        'trace': 0,
        'info': 1,
        'warn': 2,
        'error': 3,
        'debug': 4,
    }

    private levelID: number = 4;
    
    constructor(
        private className: string,
        public level: string
    ) {
        this.levelID = this.levels[level] || 4;
    }

    info(msg: string) {
        if (this.levelID >= this.levels.info) {
            console.log(`[INFO]: ${this.className} - ${msg}`);
        }
    }
    debug(msg: string) {
        if (this.levelID >= this.levels.debug) {
            console.log(`[DEBUG]: ${this.className} - ${msg}`);
        }
    }
    warn(msg: string) {
        if (this.levelID >= this.levels.warn) {
            console.log(`[WARN]: ${this.className} - ${msg}`);
        }
    }
    error(msg: string) {
        if (this.levelID >= this.levels.error) {
            console.log(`[ERROR]: ${this.className} - ${msg}`);
        }
    }
}


export function getLogger(className: string): ILogger {
    let config = loadConfig();
    try {
        return new Logger(className, config.logging.level);
    } catch(Err) {
        console.log(Err)
    }
    
}