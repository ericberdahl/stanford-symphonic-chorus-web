import { createDateTime } from './dateTimeUtils';
import { BasicEvent, BasicEventStaticProps, SerializedBasicEvent } from './event';
import { PerformanceRepertoire, PerformanceRepertoireStaticProps, SerializedPerformanceRepertoire } from './performanceRepertoire';

import { DateTime } from 'luxon';

export type SerializedDressRehearsalEvent = SerializedBasicEvent & {
    repertoire? :   SerializedPerformanceRepertoire;
}

export type DressRehearsalEventStaticProps = BasicEventStaticProps & {
    repertoire :    PerformanceRepertoireStaticProps;
}

export class DressRehearsalEvent extends BasicEvent {
    readonly repertoire :   PerformanceRepertoire;

    private constructor(start : DateTime, location : string, repertoire : PerformanceRepertoire) {
        super(start, location);
        this.repertoire = repertoire;
    }

    async getStaticProps() : Promise<DressRehearsalEventStaticProps> {    
        return {
            ...await super.getStaticProps(),

            repertoire: this.repertoire ? await this.repertoire.getStaticProps() : null,
        };
    }

    static async deserialize(data : SerializedDressRehearsalEvent) : Promise<DressRehearsalEvent> {
        return new DressRehearsalEvent(createDateTime(data.date, data.start), data.location,
                                       data.repertoire ? await PerformanceRepertoire.deserialize(data.repertoire) : null);
    }
}
