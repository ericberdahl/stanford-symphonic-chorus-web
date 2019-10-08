const debug = require('debug')('collection-references');

module.exports = plugin;

function crossReference(collections, options) {
    debug('checking cross-references for %o', options);

    const sources = collections[options.source].all;
    const destinations = collections[options.destination].all;

    // Ensure each source and destination has a references collection
    sources.forEach((src) => {
        src.references = src.references || {};
        src.references[options.destination] = src.references[options.destination] || [];
    });
    destinations.forEach((dest) => {
        dest.references = dest.references || {};
        dest.references[options.source] = dest.references[options.source] || [];
    });

    sources.forEach((src) => {
        destinations.forEach((dest) => {
            if (options.match(src, dest)) {
                debug('linking %s and %s', src.path, dest.path);
                src.references[options.destination].push(dest);
                dest.references[options.source].push(src);
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
        options.forEach((o) => crossReference(metadata.catalog, o));

        debug('complete');
        done();
    };
}