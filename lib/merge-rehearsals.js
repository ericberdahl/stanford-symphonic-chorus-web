const debug = require('debug')('merge-rehearsals');

function mergeRehearsals(options)
{
    debug('registering');
    return (files, metalsmith, done) => {
        debug('starting');

        const metadata = metalsmith.metadata();
        const performances = metadata.collections.performances;

        performances.forEach((program) => {
            program._allRehearsals = [];
            if (program.rehearsals)
            {
                program._allRehearsals = program._allRehearsals.concat(program.rehearsals);
            }
            if (program.sectionals)
            {
                program._allRehearsals = program._allRehearsals.concat(program.sectionals);
            }
            debug('%s before sort %o', program.quarter, program._allRehearsals);

            program._allRehearsals.sort((a, b) => {
                return (a.start.getTime() - b.start.getTime());
            });
            debug('%s after sort %o', program.quarter, program._allRehearsals);
        });

        debug('complete');
        done();
    }
}

module.exports = mergeRehearsals;