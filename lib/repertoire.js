const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);
const pieceUtils = require('./piece-utils');

function getRepertoireEntry(rep, piece) {
    const allByComposer = _.get(rep, [ 'byComposer', piece.composer ], []);
    _.set(rep, [ 'byComposer', piece.composer ], allByComposer);

    let result = _.find(allByComposer, (p) => { 
        return 0 == pieceUtils.compare(piece, p.piece);
    });
    if (!result) {
        result = {
            piece: piece,
            fylp: null,
            performances: [],
        }

        allByComposer.push(result);
        rep.all.push(result);
    }

    return result;
}

module.exports = (options) => {
    const repertoire = {
        all: [],
        byComposer: {},
        composers: [],
    };

    return (files, metalsmith, done) => {
        const catalog = metalsmith.metadata().catalog;
        if (!catalog.fylp) throw new Error("repertoire plugin requires that fylp already be collected");
        if (!catalog.performances) throw new Error("repertoire plugin requires that performances already be collected");

        _.forEach(catalog.fylp.all, (fylp) => {
            const repEntry = getRepertoireEntry(repertoire, fylp.piece);
            repEntry.fylp = fylp;
            logs.debug('added fylp to repEntry for %s/%o',
                repEntry.piece.composer, repEntry.piece.title);

            _.set(fylp, 'references.performances', []);
        });

        _.forEach(catalog.performances.all, (perf) => {
            _.set(perf, 'references.fylp', []);
            _.forEach(perf.repertoire, (piece) => {
                const repEntry = getRepertoireEntry(repertoire, piece);
                logs.debug('added %s perforance repEntry for %s/%s/%o',
                        perf.quarter,
                        repEntry.piece.composer, repEntry.piece.movement, repEntry.piece.title);

                repEntry.performances.push(perf);
                if (repEntry.fylp) {
                    perf.references.fylp.push(repEntry.fylp);
                    repEntry.fylp.references.performances.push(perf);
                }
            });
        });

        repertoire.composers = _.keys(repertoire.byComposer).sort();
        catalog.repertoire = repertoire;
        
        done();
    };
}