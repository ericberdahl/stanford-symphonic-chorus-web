const _ = require('lodash');
const debug = require('debug')('find-performances');

function findPerformances(options)
{
    return (files, metalsmith, done) => {
        debug('starting');

        const metadata = metalsmith.metadata();
        const performances = _.defaults(metadata, { performances: {} }).performances;

        debug('fetching all performances');
        performances.all = metadata.collections.performances;

        debug('finding current performance');
        performances.current = performances.all.slice().reverse().find((value, index, array) => {
            return !value.isFuture;
        });

        debug('finding future performances');
        performances.future = performances.all.filter((item) => {
            return item.first_concert.start > performances.current.first_concert.start;
        });

        debug('finding up to date performances');
        performances.upToDate = performances.all.filter((item) => {
            return item.first_concert.start <= performances.current.first_concert.start;
        });

        debug('computing _.year for each performance');
        _.forEach(performances.all, (perf) => {
            _.set(perf, '_.year', perf.first_concert.start.getFullYear());
        });

        done();
    };
}

module.exports = findPerformances;