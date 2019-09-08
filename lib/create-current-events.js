const debug = require('debug')('create-current-events');

function createEvents(options)
{
    return (files, metalsmith, done) => {
        debug('starting');

        const metadata = metalsmith.metadata();
        const currentProgram = metadata.performances.current;

        metadata.currentEvents = [];
        if (currentProgram.concerts)
        {
            metadata.currentEvents = metadata.currentEvents.concat(currentProgram.concerts);
        }
        if (currentProgram.first_rehearsal)
        {
            metadata.currentEvents = metadata.currentEvents.concat(currentProgram.first_rehearsal);
        }
        if (currentProgram.events)
        {
            metadata.currentEvents = metadata.currentEvents.concat(currentProgram.events);
        }
        debug('original list %o', metadata.currentEvents);

        metadata.currentEvents.sort((a, b) => {
            return (a.start.getTime() - b.start.getTime());
        });
        debug('shorted list %o', metadata.currentEvents);

        debug('finished');
        done();
    }
}

module.exports = createEvents;
