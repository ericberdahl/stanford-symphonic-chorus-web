const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);

//
// TODO revamp compareAny
// * type-map of comparator functions
// * logic to select the type used for comparison
//

function getTypeOf(a) {
    if (_.isNumber(a)) return 'number';
    else if (_.isString(a)) return 'string';
    else if (_.isArray(a)) return 'Array';
    else if (_.isUndefined(a)) return 'undefined';

    return 'Generic';
}

const comparatorMap = {
    'number/number': compareNumbers,
    'undefined/number': compareNumbers,
    'number/undefined': compareNumbers,

    'string/string': compareStrings,
    'undefined/string': compareStrings,
    'string/undefined': compareStrings,

    'Array/Array': compareArrays,
    'undefined/Array': compareArrays,
    'Array/undefined': compareArrays,
}

function compareAny(a, b) {
    const typeOfA = getTypeOf(a);
    const typeOfB = getTypeOf(b);
    const key = typeOfA + '/' + typeOfB;

    let comparator = _.get(comparatorMap, key);
    if (!comparator && typeOfA == typeOfB) {
        comparator = compareGeneric;
    }

    if (!comparator) throw "no comparator for " + key;

    return comparator(a, b);
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
