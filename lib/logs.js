const debug = require('debug');
const path = require('path');

const boundConsoleLog = console.info.bind(console);

function createFromFilename(filename) {
    const debugname = path.basename(filename, path.extname(filename));

    const logs = {
        debug: debug(debugname),
        info: debug(debugname + '*'),
        error: debug(debugname + ':<error>*'),
    };

    logs.debug.log = boundConsoleLog;
    logs.error.log = boundConsoleLog;

    return logs;
}

module.exports = {
    forFilename: createFromFilename,
}