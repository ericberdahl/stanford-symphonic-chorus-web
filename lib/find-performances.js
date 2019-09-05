const debug = require('debug')('find-performances');
const defaults = require('defaults');

function findPerformances(options)
{
    return (files, metalsmith, done) => {
        debug('starting');

        const metadata = metalsmith.metadata();
        metadata.performances = defaults(metadata.performances, {});

        debug('fetching all performances');
        metadata.performances.all = metadata.collections.performances;

        debug('finding current performance');
        metadata.performances.current = metadata.performances.all.slice().reverse().find((value, index, array) => {
            return !value.isFuture;
        });

        debug('finding future performances');
        metadata.performances.future = metadata.performances.all.filter((item) => {
            return item.first_concert.start > metadata.performances.current.first_concert.start;
        });

        debug('finding up to date performances');
        metadata.performances.upToDate = metadata.performances.all.filter((item) => {
            return item.first_concert.start <= metadata.performances.current.first_concert.start;
        });

        done();
    };
}

module.exports = findPerformances;