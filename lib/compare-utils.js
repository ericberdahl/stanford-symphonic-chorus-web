const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);

function compareGeneric(a, b) {
    if (a == b) return 0;
    return (a < b ? -1 : 1);
}

function compareArrays(a, b) {
    const zippedElements = _.slice(_.zip(a, b), 0, _.min(a.length, b.length));
    
    let result = 0;

    _.forEach(zippedElements, (e) => {
        result = compareGeneric(e[0], e[1]);
        return (result == 0);
    });

    if (0 == result) {
        result = a.length - b.length;
    }

    return result;
}

module.exports = {
    generic: compareGeneric,
    arrays: compareArrays,
}
