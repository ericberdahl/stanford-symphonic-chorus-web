const debug = require('debug');
const path = require('path');

const boundConsoleLog = console.info.bind(console);

class Logs
{
    constructor(filename) {
        const debugname = path.basename(filename, path.extname(filename));
    
        this.debug = debug(debugname);
        this.info = debug(debugname + '*');
        this.error = debug(debugname + ':<error>*');
    
        this.debug.log = boundConsoleLog;
        this.error.log = boundConsoleLog;
    }
}

function createFromFilename(filename) {
    return new Logs(filename);
}

module.exports = {
    Logs: Logs,
    forFilename: createFromFilename,
}