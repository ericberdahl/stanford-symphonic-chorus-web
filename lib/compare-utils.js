const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);

function compareAny(a, b) {
    if (_.isNumber(a) && _.isNumber(b)) return compareNumbers(a, b);
    else if (_.isString(a) && _.isString(b)) return compareStrings(a, b);
    else if (_.isArray(a) && _.isArray(b)) return compareArrays(a, b);

    logs.debug('falling through to generic comparision for types %s and %s', typeof a, typeof b);

    return compareGeneric(a, b);
}

function compareGeneric(a, b) {
    if (a == b) return 0;
    return (a < b ? -1 : 1);
}

function compareArrays(a, b) {
    const zippedElements = _.slice(_.zip(a, b), 0, _.min(a.length, b.length));
    
    let result = 0;

    _.forEach(zippedElements, (e) => {
        result = compareAny(e[0], e[1]);
        return (result == 0);
    });

    if (0 == result) {
        result = compareNumbers(a.length, b.length);
    }

    return result;
}

function compareNumbers(a, b) {
    return a - b;
}

function compareStrings(a, b, caseSensitive) {
    if (!caseSensitive) {
        a = _.toLower(a);
        b = _.toLower(b);
    }

    return compareGeneric(a, b);
}

module.exports = {
    any: compareAny,
    generic: compareGeneric,
    arrays: compareArrays,
    numbers: compareNumbers,
    strings: compareStrings,
}
