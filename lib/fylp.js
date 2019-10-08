const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);
const pieceUtils = require('./piece-utils');
const pluginKit = require('metalsmith-plugin-kit');

module.exports = (options) => {
    const fylp = {
        all: [],
        byComposer: {},
        composers: [],
    };

    return pluginKit.middleware({
        each: (filename, fileObject, files, metalsmith) => {
            fylp.all.push(fileObject);
            fylp.composers.push([fileObject.piece.composer, pieceUtils.composerFamilyName(fileObject.piece)]);

            const a = _.get(fylp.byComposer, fileObject.piece.composer, []);
            a.push(fileObject);
            _.set(fylp.byComposer, fileObject.piece.composer, a);
        },
        after: (files, metalsmith) => {
            // sort composers by family name
            fylp.composers.sort((a, b) => {
                return pieceUtils.compareGenericHack(a[1], b[1]);
            });

            // reduce composers to a single element and remove duplicates
            fylp.composers = fylp.composers.map((value) => value[0]);
            fylp.composers = _.uniq(fylp.composers);

            // sort each composer entry alphabetically
            _.forEach(fylp.byComposer, (value, index, collection) => {
                value.sort((a, b) => {
                    return pieceUtils.compare(a.piece, b.piece);
                });
            });

            metalsmith.metadata().fylp = fylp;
        },
        match: 'fylp/*.hbs',
    });
}