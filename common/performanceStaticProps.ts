import { fileRoutesStaticProps, FileRouteStaticProp, ImageRoutesStaticProps, imageRoutesStaticProps } from './fileRoutesStatiicProps';
import { GalleryStaticProps } from './gallery';
import { BasicEvent, Concert, GenericEvent, ISoloist, Performance, Rehearsal  } from './performance';
import { PieceStaticProps, pieceStaticProps } from './piece';

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export type PerformanceRefStaticProps = {
    id : string;
    quarter : string;
}

type BasicEventStaticProps = {
    start : string; // ISO time
    location : string;
}

type GenericEventStaticProps = BasicEventStaticProps & {
    title : string;
}

type ConcertStaticProps = BasicEventStaticProps & {
    call : string;  // ISO time
}

type SoloistStaticProps = {
    name : string;
    part : string;
}

type RehearsalStaticProps = {
    start : string; // ISO date-time
    end : string;   // ISO date-time
    location : string;
    notes : string[];
}

export type PerformanceStaticProps = {
    collaborators : string[];
    concerts : ConcertStaticProps[];
    descriptionMDX : MDXRemoteSerializeResult;
    directors : string[];
    dressRehearsals : BasicEventStaticProps[];
    events : GenericEventStaticProps[];
    galleries: GalleryStaticProps[];
    heraldImageRoutes : ImageRoutesStaticProps;
    id : string;
    instructors : string[];
    mainPieces : PieceStaticProps[];
    membershipLimit : number;
    posterRoutes : ImageRoutesStaticProps;
    preregisterDate : string;   // ISO date-time
    quarter : string;
    registrationFee : string;
    repertoire : PieceStaticProps[];
    sectionalsSopranoAlto : RehearsalStaticProps[];
    sectionalsTenorBass : RehearsalStaticProps[];
    soloists : SoloistStaticProps[];
    supplementsMDX : MDXRemoteSerializeResult[];
    syllabusRoutes : FileRouteStaticProp[];
    tuttiRehearsals : RehearsalStaticProps[];
}

export function basicEventStaticProps(event : BasicEvent) : BasicEventStaticProps {
    return {
        start:      event.start.toISO(),
        location:   event.location,
    };
}

export function genericEventStaticProps(event : GenericEvent) : GenericEventStaticProps {
    const base = basicEventStaticProps(event);

    return {
        start:      base.start,
        location:   base.location,
        title:      event.title || null,
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

function soloistStaticProps(soloist : ISoloist) : SoloistStaticProps {
    return {
        name: soloist.name,
        part: soloist.part || null,
    }
}

function rehearsalStaticProps(rehearsal : Rehearsal) : RehearsalStaticProps {
    return {
        start:      rehearsal.start.toISO(),
        end:        rehearsal.end.toISO(),
        location:   rehearsal.location,
        notes:      rehearsal.notes,
    }
}

export function performanceRefStaticProps(performance : Performance) : PerformanceRefStaticProps {
    return {
        id:         performance.id,
        quarter:    performance.quarter
    }
}

export async function performanceStaticProps(performance) : Promise<PerformanceStaticProps> {
    return {
        collaborators:      performance.collaborators,
        concerts:           performance.concerts.map(concertStaticProps),
        descriptionMDX:     await mdxSerializeMarkdown(performance.description),
        directors:          performance.directors,
        dressRehearsals:    performance.dressRehearsals.map(basicEventStaticProps),
        events:             performance.events.map(genericEventStaticProps),
        galleries:          await Promise.all(performance.galleries.map(async (g) => await g.getRefStaticProps())),
        heraldImageRoutes:  imageRoutesStaticProps(performance.heraldImageRoutes),
        id:                 performance.id,
        instructors:        performance.instructors,
        mainPieces:         await Promise.all(performance.mainPieces.map(pieceStaticProps)),
        membershipLimit:    performance.membershipLimit,
        posterRoutes:       imageRoutesStaticProps(performance.posterRoutes),
        preregisterDate:    performance.preregisterDate?.toISO() || null,
        quarter:            performance.quarter,
        registrationFee:    performance.registrationFee,
        repertoire:         await Promise.all(performance.repertoire.map(pieceStaticProps)),
        sectionalsSopranoAlto:  performance.sectionalsSopranoAlto.map(rehearsalStaticProps),
        sectionalsTenorBass:    performance.sectionalsTenorBass.map(rehearsalStaticProps),
        soloists:               performance.soloists.map(soloistStaticProps),
        supplementsMDX:         await Promise.all(performance.supplements.map((s) => mdxSerializeMarkdown(s))),
        syllabusRoutes:         fileRoutesStaticProps(performance.syllabusRoutes),
        tuttiRehearsals:        performance.tuttiRehearsals.map(rehearsalStaticProps),
    };
}
