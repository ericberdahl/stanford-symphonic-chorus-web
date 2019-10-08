const _ = require('lodash');
const logs = require('./logs').forFilename(__filename);
const pluginKit = require('metalsmith-plugin-kit');

// TODO we're going to do the work of
// - sanity-check-dates

module.exports = (options) => {
    const performances = {
        all: [],
        current: null,
        future: [],
        upToDate: [],
        // TODO create byYear grouping
    };

    return pluginKit.middleware({
        each: (filename, fileObject, files, metalsmith) => {
            performances.all.push(fileObject);

            if (fileObject.isFuture) {
                performances.future.push(fileObject);
            }
            else {
                performances.upToDate.push(fileObject);
            }

            // TODO sanity check that all dates in the performance are, in fact, Date objects

            //
            // Merge rehearsals into single list
            //
            fileObject._allRehearsals = [];
            if (fileObject.rehearsals)
            {
                fileObject._allRehearsals = fileObject._allRehearsals.concat(fileObject.rehearsals);
            }
            if (fileObject.sectionals)
            {
                fileObject._allRehearsals = fileObject._allRehearsals.concat(fileObject.sectionals);
            }
            logs.debug('%s _allRehearsals before sort %o', fileObject.quarter, fileObject._allRehearsals);

            fileObject._allRehearsals.sort((a, b) => {
                return (a.start.getTime() - b.start.getTime());
            });
            logs.debug('%s _allRehearsals after sort %o', fileObject.quarter, fileObject._allRehearsals);
        },

        after: (files, metalsmith) => {
            performances.all.sort((a, b) => {
                return a.first_concert.start.getTime() - b.first_concert.start.getTime();
            });

            performances.future.sort((a, b) => {
                return a.first_concert.start.getTime() - b.first_concert.start.getTime();
            });

            performances.upToDate.sort((a, b) => {
                return a.first_concert.start.getTime() - b.first_concert.start.getTime();
            });

            performances.current = _.last(performances.upToDate);

            let previous = null;
            _.forEach(performances.all, (perf) => {
                _.set(previous, 'next', perf);
                _.set(perf, 'previous', previous);
                _.set(perf, 'next', null);

                previous = perf;

                _.set(perf, '_.year', perf.first_concert.start.getFullYear());
            });
    
            // TODO set next and previous links on each performance
            // TODO sanity check that future performances are all after current performance

            _.set(metalsmith.metadata(), 'catalog.performances', performances);
        },

        match: 'performances/*/schedule.hbs',
    });
}