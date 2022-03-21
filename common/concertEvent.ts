import { createDateTime } from './dateTimeUtils';
import { BasicEvent, BasicEventStaticProps, SerializedBasicEvent } from './event';
import { PerformanceRepertoire, PerformanceRepertoireStaticProps, SerializedPerformanceRepertoire } from './performanceRepertoire';

import { DateTime } from 'luxon';

export type SerializedConcertEvent = SerializedBasicEvent & {
    call :          string;  // 'HH:MM' : 24-hour formatted call time for the concert
    repertoire? :   SerializedPerformanceRepertoire;
}

export type ConcertEventStaticProps = BasicEventStaticProps & {
    call :          string;  // ISO time
    repertoire :    PerformanceRepertoireStaticProps;
}

export class ConcertEvent extends BasicEvent {
    readonly call :         DateTime;
    readonly repertoire :   PerformanceRepertoire;

    private constructor(start : DateTime, location : string, call : DateTime, repertoire : PerformanceRepertoire) {
        super(start, location);
        this.call = call;
        this.repertoire = repertoire;
    }

    async getStaticProps() : Promise<ConcertEventStaticProps> {    
        return {
            ...await super.getStaticProps(),

            call:       this.call.toISO(),
            repertoire: this.repertoire ? await this.repertoire.getStaticProps() : null,
        };
    }

    static async deserialize(data : SerializedConcertEvent) : Promise<ConcertEvent> {
        return new ConcertEvent(createDateTime(data.date, data.start), data.location,
                                createDateTime(data.date, data.call),
                                data.repertoire ? await PerformanceRepertoire.deserialize(data.repertoire) : null);
    }
}
