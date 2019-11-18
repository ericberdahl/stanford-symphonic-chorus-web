const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);
const compareUtils = require('./compare-utils');

function getComposerFamilyName(piece) {
    return _.defaultTo(piece.composerFamilyName,
                       _.last(_.defaultTo(piece.composer, '').split(' ')));
}

function comparePieces(a, b) {
    let result = compareUtils.generic(getComposerFamilyName(a), getComposerFamilyName(b));
    
    if (0 == result) {
        result = compareUtils.arrays(_.castArray(a.title), _.castArray(b.title));
    }

    if (0 == result) {
        result = compareUtils.generic(a.movement, b.movement);
    }

    return result;
}

module.exports = {
    compare: comparePieces,
    composerFamilyName: getComposerFamilyName,
}