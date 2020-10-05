import { default as debug } from 'debug';
import { basename, extname } from 'path';

const boundConsoleLog = console.info.bind(console);

export class Logs
{
    readonly debug;
    readonly info;
    readonly error;
    
    constructor(filename: string) {
        const debugname = basename(filename, extname(filename));
    
        this.debug = debug(debugname);
        this.info = debug(debugname + '*');
        this.error = debug(debugname + ':<error>*');
    
        this.debug.log = boundConsoleLog;
        this.error.log = boundConsoleLog;
    }
}

export function forFilename(filename: string) {
    return new Logs(filename);
}
