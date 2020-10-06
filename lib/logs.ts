import { default as debug, Debugger  } from 'debug';
import { basename, extname } from 'path';

const boundConsoleLog = console.info.bind(console);

export class Logs
{
    readonly debug: Debugger;
    readonly info: Debugger;
    readonly error: Debugger;
    
    constructor(filename: string) {
        const debugname: string = basename(filename, extname(filename));
    
        this.debug = debug(debugname);
        this.info = debug(debugname + '*');
        this.error = debug(debugname + ':<error>*');
    
        this.debug.log = boundConsoleLog;
        this.error.log = boundConsoleLog;
    }
}

export function forFilename(filename: string): Logs {
    return new Logs(filename);
}
