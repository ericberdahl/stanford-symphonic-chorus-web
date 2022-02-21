import { createDateTime, compareDateTime } from './dateTimeUtils';

import { DateTime } from 'luxon';

export enum RehearsalFrequency {
    weekly = 'weekly',
    once = 'once'
}

export type SerializedRehearsalSequence = {
    frequency? : RehearsalFrequency;
    startDate : string; // 'YYYY-MM-DD' : date on which the first rehearsal will occur
    endDate? : string;  // 'YYYY-MM-DD' : if present, date on which the last rehearsal will occur. Required unless frequence is 'once'
    startTime: string;  // 'HH:MM' : 24-hour formatted time at which rehearsals start
    endTime: string;    // 'HH:MM' : 24-hour formatted time at which rehearsals end
    location: string    // nickname of the location at which rehearsals are held
}

export type RehearsalStaticProps = {
    start : string; // ISO date-time
    end : string;   // ISO date-time
    location : string;
    notes : string[];
}

// TODO : Why is this not a BasicEvent?
export class Rehearsal {
    readonly start : DateTime;
    readonly end : DateTime;
    readonly location : string;
    readonly notes : string[] = [];

    constructor(start : DateTime, end : DateTime, location : string) {
        this.start = start;
        this.end = end;
        this.location = (location || '');
    }

    async getStaticProps() : Promise<RehearsalStaticProps> {
        return {
            start:      this.start.toISO(),
            end:        this.end.toISO(),
            location:   this.location,
            notes:      this.notes,
        }
    }    

    // TODO : deserializeSequence should be an async function
    static deserializeSequence(spec : SerializedRehearsalSequence) : Rehearsal[] {
        const frequency : RehearsalFrequency = (spec.frequency ? spec.frequency : RehearsalFrequency.once);

        const computeDateShift = (f : string) => {
            if (RehearsalFrequency.once == f) return { days: 1 };
            if (RehearsalFrequency.weekly == f) return { days: 7 };
            throw new Error(`Unkonwn frequency "${f}"`);
        }
        const dateShift = computeDateShift(frequency);

        if (RehearsalFrequency.once != frequency && !spec.endDate) {
            throw new Error(`Event sequences with "${frequency}" frequency require an endDate`);
        }
        const endDate : string = (spec.endDate ? spec.endDate : spec.startDate);
        const finalStartDateTime : DateTime = createDateTime(endDate, spec.startTime);

        var nextStartDateTime : DateTime = createDateTime(spec.startDate, spec.startTime);
        var nextEndDateTime : DateTime = createDateTime(spec.startDate, spec.endTime);

        var result : Rehearsal[] = [];
        do {
            result.push(new Rehearsal(nextStartDateTime, nextEndDateTime, spec.location));

            nextStartDateTime = nextStartDateTime.plus(dateShift);
            nextEndDateTime = nextEndDateTime.plus(dateShift);
        } while(compareDateTime(nextStartDateTime, finalStartDateTime) >= 0);

        return result;
    }
}
