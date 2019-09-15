const error = require('debug')('sanity-check-dates:<error>*');

function sanityCheckDates(options)
{
    return (files, metalsmith, done) => {
        const metadata = metalsmith.metadata();
        const performances = metadata.collections.performances;

        performances.forEach((program) => {
            let notDates = [];

            const checkOneDate = (d) => {
                if (!(d instanceof Date))
                {
                    notDates.push(d);
                }
            }

            if (program.rehearsals)
            {
                program.rehearsals.forEach((a) => {
                    checkOneDate(a.start);
                    checkOneDate(a.end);
                    if (a.hasOwnProperty('registration'))
                    {
                        checkOneDate(a.registration);
                    }
                });
            }

            if (program.sectionals)
            {
                program.sectionals.forEach((a) => {
                    checkOneDate(a.start);
                    checkOneDate(a.end);
                });
            }

            if (program.dresses)
            {
                program.dresses.forEach((a) => {
                    checkOneDate(a.start);
                });
            }

            if (program.concerts)
            {
                program.concerts.forEach((a) => {
                    checkOneDate(a.start);
                    checkOneDate(a.call);
                });
            }

            if (program.events)
            {
                program.events.forEach((a) => {
                    checkOneDate(a.start);
                });
            }

            notDates.forEach((a) => {
                error('Quarter %s - %s is a malformed Date', program.quarter, a);
            });
        });

        done();
    }
}

module.exports = sanityCheckDates;