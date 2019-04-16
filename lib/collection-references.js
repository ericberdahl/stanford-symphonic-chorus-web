const debug = require('debug')('collection-references');

module.exports = plugin;

function crossReference(collections, reference) {
    debug('checking cross-references for %o', reference);

    const sources = collections[reference.source];
    const destinations = collections[reference.destination];

    // Ensure each source and destination has a references collection
    sources.forEach((src) => {
        src.references = src.references || {};
        src.references[reference.destination] = src.references[reference.destination] || [];
    });
    destinations.forEach((dest) => {
        dest.references = dest.references || {};
        dest.references[reference.source] = dest.references[reference.source] || [];
    });

    sources.forEach((src) => {
        destinations.forEach((dest) => {
            if (reference.match(src, dest)) {
                debug('linking %s and %s', src.path, dest.path);
                src.references[reference.destination].push(dest);
                dest.references[reference.source].push(src);
            }
        });
    });
}

function plugin(options) {
    if (!Array.isArray(options)) {
        options = [options];
    }

    return (files, metalsmith, done) => {
        debug('starting');

        const metadata = metalsmith.metadata();
        options.forEach((o) => crossReference(metadata.collections, o));

        debug('complete');
        done();
    };
}