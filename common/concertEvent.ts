import { createDateTime } from './dateTimeUtils';
import { BasicEvent, BasicEventStaticProps, SerializedBasicEvent } from './event';
import { PerformanceRepertoire, PerformanceRepertoireStaticProps, SerializedPerformanceRepertoire } from './performanceRepertoire';

import { DateTime } from 'luxon';

export type SerializedConcertEvent = SerializedBasicEvent & {
    call :              string;  // 'HH:MM' : 24-hour formatted call time for the concert
    collaborators? :    string[];
    repertoire? :       SerializedPerformanceRepertoire;
    ticketLink? :       string;
}

export type ConcertEventStaticProps = BasicEventStaticProps & {
    call :          string;  // ISO time
    collaborators : string[];
    repertoire :    PerformanceRepertoireStaticProps;
    ticketLink :    string;
}

export class ConcertEvent extends BasicEvent {
    readonly call :             DateTime;
    readonly collaborators :    string[];
    readonly repertoire :       PerformanceRepertoire;
    readonly ticketLink :       string;

    private constructor(start : DateTime,
                        location : string,
                        call : DateTime,
                        repertoire : PerformanceRepertoire,
                        collaborators : string[],
                        ticketLink : string) {
        super(start, location);
        this.call = call;
        this.collaborators = collaborators;
        this.repertoire = repertoire;
        this.ticketLink = ticketLink;
    }

    async getStaticProps() : Promise<ConcertEventStaticProps> {    
        return {
            ...await super.getStaticProps(),

            call:           this.call.toISO(),
            collaborators:  this.collaborators || null,
            repertoire:     this.repertoire ? await this.repertoire.getStaticProps() : null,
            ticketLink:     this.ticketLink || null,
        };
    }

    static async deserialize(data : SerializedConcertEvent) : Promise<ConcertEvent> {
        return new ConcertEvent(createDateTime(data.date, data.start), data.location,
                                createDateTime(data.date, data.call),
                                data.repertoire ? await PerformanceRepertoire.deserialize(data.repertoire) : null,
                                data.collaborators || null,
                                data.ticketLink || null);
    }
}
