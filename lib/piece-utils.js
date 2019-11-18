const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);
const compareUtils = require('./compare-utils');

function getComposerFamilyName(piece) {
    return _.defaultTo(piece.composerFamilyName,
                       _.last(_.defaultTo(piece.composer, '').split(' ')));
}

function comparePieces(a, b) {
    const logData = { };

    let result = compareUtils.strings(getComposerFamilyName(a), getComposerFamilyName(b));
    logData.composerFamilyName = result;

    // TODO need to compare over full name, in order of [family name, first name, middle name, etc]

    if (0 == result) {
        result = compareUtils.arrays(_.castArray(a.title), _.castArray(b.title));
        logData.title = result;
    }

    if (0 == result) {
        result = compareUtils.strings(a.movement, b.movement);
        logData.movement = result;
    }

    logs.debug('{\n a=%o\n b=%o\n result=%o\n}', a, b, logData);

    return result;
}

function sanitizePiece(p) {
    return _.pick(p, [
        'composer',
        'composerFamilyName',   // TODO do we want this full-time?
        'movement',
        'title',
        'translation',
        'commonTitle',
        'catalog'
    ]);
}

module.exports = {
    compare: comparePieces,
    composerFamilyName: getComposerFamilyName,
    sanitize: sanitizePiece,
}