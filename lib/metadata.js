const debug = require('debug')('metadata');
const defaults = require('defaults');
const glob = require('glob');
const path = require('path');
const yaml = require('node-yaml');

function fileToKeyPath(f, parsedPath) {
    return parsedPath.dir.split(path.sep).filter(segment => segment != '');
}

function buildNestedMetadata(options)
{
    options = options || {};
    options = defaults(options, {
        directory: 'data',
        pattern: '**/*.yml',
        rootKey: '',
        fileMapper: fileToKeyPath
    });

    return (files, metalsmith, done) => {
        debug('adding metadata %s from directory %s to metadata.%s', options.pattern, options.directory, options.rootKey);

        const metadata = metalsmith.metadata();
        debug('starting metadata %o', metadata);

        glob(options.pattern, { cwd: options.directory }, (err, files) => {
            if (err)
            {
                done(err);
                return;
            }

            if (options.rootKey != '') metadata[options.rootKey] = metadata[options.rootKey] || {}
            const metadataRoot = (options.rootKey == '' ? metadata : metadata[options.rootKey]);

            files.forEach((f) => {
                debug('processing %s', f);

                const data = yaml.readSync(path.join(metalsmith.directory(), options.directory, f));

                const parsedPath = path.parse(f);
                const keyPath = options.fileMapper(f, parsedPath);

                const dataParent = keyPath.reduce((current, item) => {
                        current[item] = current[item] || {};
                        return current[item];
                    }, metadataRoot);
                dataParent[parsedPath.name] = data;
            });

            debug('final metadata %o', metadata);
            done();
        });
    };
}

module.exports = buildNestedMetadata;
