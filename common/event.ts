import { createDateTime, compareDateTime } from './dateTimeUtils';

import { DateTime } from 'luxon';

export type SerializedBasicEvent = {
    date : string;      // 'YYYY-MM-DD' : date of the event
    start : string;     // 'HH:MM' : 24-hour formatted start time of the event
    location : string;  // nickname of the location of the event
}

export type BasicEventStaticProps = {
    start : string; // ISO time
    location : string;
}

export class BasicEvent {
    readonly location : string;
    readonly start : DateTime;

    constructor(start : DateTime, location : string) {
        this.start = start;
        this.location = location;
    }

    async getStaticProps() : Promise<BasicEventStaticProps> {
        return {
            start:      this.start.toISO(),
            location:   this.location,
        };
    }
};

export type SerializedGenericEvent = SerializedBasicEvent & {
    title : string;
}

export type GenericEventStaticProps = BasicEventStaticProps & {
    title : string;
}

export class GenericEvent extends BasicEvent {
    readonly title : string;

    constructor(start : DateTime, location : string, title : string) {
        super(start, location);
        this.title = title;
    }

    async getStaticProps() : Promise<GenericEventStaticProps> {
        return {
            ...await super.getStaticProps(),

            title:  this.title || null,
        };
    }

    static async deserialize(data : SerializedGenericEvent) : Promise<GenericEvent> {
        return new GenericEvent(createDateTime(data.date, data.start),
                                data.location,
                                data.title);
    }
}