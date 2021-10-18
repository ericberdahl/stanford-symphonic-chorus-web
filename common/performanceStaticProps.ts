import { BasicEvent, Concert, Performance  } from './performance';

export type PerformanceRefStaticProps = {
    id : string;
    quarter : string;
}

type BasicEventStaticProps = {
    start : string; // ISO time
    location : string;
};

type ConcertStaticProps = BasicEventStaticProps & {
    call : string;  // ISO time
}

export function basicEventStaticProps(event : BasicEvent) : BasicEventStaticProps {
    return {
        start:      event.start.toISO(),
        location:   event.location,
    };
}

export function concertStaticProps(concert : Concert) : ConcertStaticProps {
    const base = basicEventStaticProps(concert);

    return {
        start:      base.start,
        location:   base.location,
        call:       concert.call.toISO(),
    };
}

export function performanceRefStaticProps(performance : Performance) : PerformanceRefStaticProps {
    return {
        id:         performance.id,
        quarter:    performance.quarter
    }
}
