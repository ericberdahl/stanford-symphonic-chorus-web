const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);

function compareGeneric(a, b) {
    if (a == b) return 0;
    return (a < b ? -1 : 1);
}

function getComposerFamilyName(piece) {
    return _.defaultTo(piece.composerFamilyName,
                       _.last(_.defaultTo(piece.composer, '').split(' ')));
}

function comparePieces(a, b) {
    let result = compareGeneric(getComposerFamilyName(a), getComposerFamilyName(b));
    if (0 == result) {
        const aTitles = _.castArray(a.title);
        const bTitles = _.castArray(b.title);

        _.forEach(aTitles, (title, index) => {
            result = (bTitles.length <= index ?
                1 :
                compareGeneric(title, bTitles[index]));
            return (result == 0);
        });

        if (0 == result) {
            result = aTitles.length - bTitles.length;
        }
    }
    if (0 == result) {
        result = compareGeneric(a.movement, b.movement);
    }

    return result;
}

module.exports = {
    compare: comparePieces,
    composerFamilyName: getComposerFamilyName,
    compareGenericHack: compareGeneric,
}