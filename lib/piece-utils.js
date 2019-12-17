const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);
const compareUtils = require('./compare-utils');

function getComposerFamilyName(piece) {
    if (!_.has(piece, '_composerFamilyName')) {
        piece = sanitizePiece(piece);
    }
    return piece._composerFamilyName;
}

function comparePieces(a, b) {
    const logData = { };

    let result = compareUtils.strings(getComposerFamilyName(a), getComposerFamilyName(b));
    logData.composerFamilyName = result;

    if (0 == result) {
        result = compareUtils.any(a.composer, b.composer);
        logData.composer = result;
    }

    if (0 == result) {
        result = compareUtils.any(_.castArray(a.title), _.castArray(b.title));
        logData.title = result;
    }

    if (0 == result) {
        result = compareUtils.any(a.movement, b.movement);
        logData.movement = result;
    }

    if (0 == result) {
        result = compareUtils.any(a.translation, b.translation);
        logData.translation = result;
    }

    if (0 == result) {
        result = compareUtils.any(a.commonTitle, b.commonTitle);
        logData.commonTitle = result;
    }

    if (0 == result) {
        result = compareUtils.any(a.catalog, b.catalog);
        logData.catalog = result;
    }

    logs.debug('{\n a=%o\n b=%o\n result=%o\n}', a, b, logData);

    return result;
}

function sanitizePiece(p) {
    const result = _.pick(p, [
        '_composerFamilyName',
        'composer',
        'title',
        'movement',
        'translation',
        'commonTitle',
        'catalog'
    ]);

    if (!_.has(result, '_composerFamilyName')) {
        result._composerFamilyName = _.defaultTo(p.composerFamilyName,
                                                 _.last(_.defaultTo(p.composer, '').split(' ')));
    }

    return result;
}

module.exports = {
    compare: comparePieces,
    composerFamilyName: getComposerFamilyName,
    sanitize: sanitizePiece,
}