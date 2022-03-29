import { createDateTime } from './dateTimeUtils';
import { BasicEvent, BasicEventStaticProps, SerializedBasicEvent } from './event';
import { PerformanceRepertoire, PerformanceRepertoireStaticProps, SerializedPerformanceRepertoire } from './performanceRepertoire';

import { DateTime } from 'luxon';

export type SerializedConcertEvent = SerializedBasicEvent & {
    call :              string;  // 'HH:MM' : 24-hour formatted call time for the concert
    repertoire? :       SerializedPerformanceRepertoire;
    collaborators? :    string[];
}

export type ConcertEventStaticProps = BasicEventStaticProps & {
    call :          string;  // ISO time
    repertoire :    PerformanceRepertoireStaticProps;
    collaborators : string[];
}

export class ConcertEvent extends BasicEvent {
    readonly call :             DateTime;
    readonly repertoire :       PerformanceRepertoire;
    readonly collaborators :    string[];

    private constructor(start : DateTime, location : string, call : DateTime, repertoire : PerformanceRepertoire, collaborators : string[]) {
        super(start, location);
        this.call = call;
        this.repertoire = repertoire;
        this.collaborators = collaborators;
    }

    async getStaticProps() : Promise<ConcertEventStaticProps> {    
        return {
            ...await super.getStaticProps(),

            call:           this.call.toISO(),
            repertoire:     this.repertoire ? await this.repertoire.getStaticProps() : null,
            collaborators:  this.collaborators || null,
        };
    }

    static async deserialize(data : SerializedConcertEvent) : Promise<ConcertEvent> {
        return new ConcertEvent(createDateTime(data.date, data.start), data.location,
                                createDateTime(data.date, data.call),
                                data.repertoire ? await PerformanceRepertoire.deserialize(data.repertoire) : null,
                                data.collaborators || null);
    }
}
