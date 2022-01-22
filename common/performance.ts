import { Composer } from "./composer";
import { FileRoutes, fileRoutesStaticProps, FileRouteStaticProp, ImageRoutes, ImageRoutesStaticProps, imageRoutesStaticProps } from './fileRoutes';
import { FYLP } from "./fylp";
import { Gallery, GalleryRefStaticProps } from './gallery'
import { IPiece, Piece, PieceStaticProps, pieceStaticProps, SerializedPiece } from './piece'
import { Model } from './model'
import { PieceSupplement } from "./pieceSupplement";
import { Repertoire } from './repertoire';
import { makeSlug } from './slug';

import { DateTime } from 'luxon';
import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

import getConfig from 'next/config'

import util from 'util';

const { serverRuntimeConfig } = getConfig()

function createDateTime(date : string, timeOfDay : string) : DateTime {
    return DateTime.fromFormat(date + ' ' + timeOfDay, 'yyyy-MM-dd HH:mm', { setZone: serverRuntimeConfig.timezone });
}

function compareDateTime(a : DateTime, b : DateTime) : number {
    return b.diff(a).toMillis();
}

enum RehearsalFrequency {
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
            throw new Error(util.format('Unkonwn frequency "%s"', f));
        }
        const dateShift = computeDateShift(frequency);

        if (RehearsalFrequency.once != frequency && !spec.endDate) {
            throw new Error(util.format('Event sequences with "%s" frequency require an endDate', frequency));
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
        const base = await super.getStaticProps();
    
        return {
            start:      base.start,
            location:   base.location,
            title:      this.title || null,
        };
    }    
}

export type SerializedConcert = SerializedBasicEvent & {
    call : string;  // 'HH:MM' : 24-hour formatted call time for the concert
}

export type ConcertStaticProps = BasicEventStaticProps & {
    call : string;  // ISO time
}

export class Concert extends BasicEvent {
    readonly call : DateTime;

    constructor(start : DateTime, location : string, call : DateTime) {
        super(start, location);
        this.call = call;
    }

    async getStaticProps() : Promise<ConcertStaticProps> {
        const base = await super.getStaticProps();
    
        return {
            start:      base.start,
            location:   base.location,
            call:       this.call.toISO(),
        };
    }    
}

export type SerializedDressRehearsal = SerializedBasicEvent;

export class DressRehearsal extends BasicEvent {

}

export type SerializedSoloist = {
    name : string;
    part : string;
}

export type SoloistStaticProps = {
    name : string;
    part : string;
}

export class Soloist {
    readonly name : string;
    readonly part : string;

    private constructor(name : string, part : string) {
        this.name = name;
        this.part = part;
    }

    async getStaticProps() : Promise<SoloistStaticProps> {
        return {
            name: this.name,
            part: this.part || null,
        }
    }

    static async deserialize(data : SerializedSoloist) : Promise<Soloist> {
        return new Soloist(data.name, data.part);
    }
}

type SerializedPerformancePiece = SerializedPiece & {
    performanceNote? : string;
}

export class NotedPerformance implements IPiece {
    readonly piece : IPiece;
    readonly note : string;

    constructor(piece : IPiece, note : string) {
        this.piece = piece;
        this.note = note;
    }

    get arranger() : string { return this.piece.arranger; }
    get catalog() : string { return this.piece.catalog; }
    get commonTitle() : string { return this.piece.commonTitle; }
    get composer() : Composer { return this.piece.composer; }
    get fylp() : FYLP { return this.piece.fylp; }
    get movement() : string { return this.piece.movement; }
    get performances() : Performance[] { return this.piece.performances; }
    get prefix() : string { return this.piece.prefix; }
    get supplements() : PieceSupplement[] { return this.piece.supplements; }
    get title() : string | string[] { return this.piece.title; }
    get translation() : string { return this.piece.translation; }

    get suffix() : string {
        const elements = [this.piece.suffix, this.note].filter((value) => value != '');
        return elements.join(' ');
    }

    addPerformance(performanace : Performance) {
        this.piece.addPerformance(performanace);
    }

    static async deserializePieceForPerformance(serializedPiece : SerializedPerformancePiece, performance : Performance, isMain : boolean, repertoire : Repertoire) {
        const piece = repertoire.addPiece(await Piece.deserialize(serializedPiece));
    
        performance.addRepertoire(serializedPiece.performanceNote ?
                                        new NotedPerformance(piece, serializedPiece.performanceNote) :
                                        piece,
                                  isMain);
    }
}

type SerializedPoster = {
    basename : string;
    caption? : string;
}

type SerializedRehearsalNote = {
    date : string;  // 'YYYY-MM-DD' : date of the rehearsal for which the note applies
    note : string;
}

type SerializedPerformance = {
    quarter : string;           // human-readable name of quarter
    syllabus : string;          // basename of syllabus asset
    directors? : string[];      // list of names of the directors
    instructors? : string[];    // list of names of the instructors
    collaborators? : string[];  // list of nicknames of collaborators
    soloists? : SerializedSoloist[];
    supplements? : string[];    // list of markup supplements for the performance
    poster? : SerializedPoster;
    heraldImage? : SerializedPoster;
    description? : string;       // Markdown to be displayed as a description of the performance being prepared, often on the home page
    preregister : string;       // 'YYYY-MM-DD' : date the preregistration mail is expected to be sent
    registrationFee? : string;   // '$dd' : amount of the registration fee
    membershipLimit? : number;
    concerts : SerializedConcert[];
    repertoire : {
        main : SerializedPerformancePiece[];
        other? : SerializedPerformancePiece[];
    };
    events? : SerializedGenericEvent[];
    tuttiRehearsals : SerializedRehearsalSequence[];
    tuttiRehearsalNotes? : SerializedRehearsalNote[];
    mensSectionals? : SerializedRehearsalSequence[];
    womensSectionals? : SerializedRehearsalSequence[];
    dressRehearsals? : SerializedDressRehearsal[];
}

export type PerformanceRefStaticProps = {
    id : string;
    quarter : string;
}

export type PerformanceStaticProps = {
    collaborators : string[];
    concerts : ConcertStaticProps[];
    descriptionMDX : MDXRemoteSerializeResult;
    directors : string[];
    dressRehearsals : BasicEventStaticProps[];
    events : GenericEventStaticProps[];
    galleries: GalleryRefStaticProps[];
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

export class Performance {
    readonly collaborators : string[]               = [];
    readonly concerts : Concert[]                   = [];
    readonly description : string;
    readonly directors : string[]                   = [];
    readonly dressRehearsals : DressRehearsal[]     = [];
    readonly events : GenericEvent[]                = [];
    readonly galleries : Gallery[]                  = [];
    readonly instructors : string[]                 = [];
    readonly mainPieces : IPiece[]                  = [];
    readonly membershipLimit : number;
    readonly preregisterDate : DateTime;
    readonly quarter : string                       = '';
    readonly registrationFee : string;
    readonly repertoire : IPiece[]                  = [];   // TODO : construct a repertoire on command using Piece.getGrandRepertoire()
    readonly sectionalsSopranoAlto : Rehearsal[]    = [];
    readonly sectionalsTenorBass : Rehearsal[]      = [];
    readonly soloists : Soloist[]                   = [];
    readonly supplements : string[]                 = [];
    readonly syllabusRoutes : FileRoutes;
    readonly tuttiRehearsals : Rehearsal[]          = [];

    private _posterRoutes : ImageRoutes;
    private _heraldImageRoutes : ImageRoutes;

    constructor(quarter : string,
                syllabusName : string,
                directors : string[],
                instructors : string[],
                collaborators : string[],
                description : string,
                preregisterDate : DateTime,
                registrationFee : string,
                membershipLimit : number) {
        this.quarter = quarter;

        if (syllabusName) {
            this.syllabusRoutes = new FileRoutes('/assets/syllabi', syllabusName, ['pdf', 'docx', 'doc'])
            if (0 == this.syllabusRoutes.routes.length) {
                throw new Error(util.format('No syllabi variants found for "%s"', syllabusName));
            }
        }

        if (directors) {
            this.directors.push(...directors);
        }
        if (instructors) {
            this.instructors.push(...instructors);
        }
        if (collaborators) {
            this.collaborators.push(...collaborators);
        }

        this.description = (description || '');
        this.preregisterDate = preregisterDate;
        this.registrationFee = registrationFee;
        this.membershipLimit = membershipLimit;
    }

    get id() { return makeSlug(this.quarter); }
    get firstConcert() { return (0 < this.concerts.length ? this.concerts[0] : null); }
    get posterRoutes() { return this._posterRoutes; }
    get heraldImageRoutes() { return this._heraldImageRoutes; }

    compare(other : Performance) {
        return compareDateTime(other.firstConcert.start, this.firstConcert.start);
    }

    addRepertoire(piece : IPiece, isMain : boolean = false) {
        piece.addPerformance(this);
        if (isMain) {
            this.mainPieces.push(piece);
        }
        this.repertoire.push(piece);
    }

    setPoster(name : string, caption : string) {
        this._posterRoutes = new ImageRoutes('/assets/posters', name, caption);
    }

    setHeraldImage(name : string, caption : string) {
        this._heraldImageRoutes = new ImageRoutes('/assets/heralds', name, caption);
    }

    async getRefStaticProps() : Promise<PerformanceRefStaticProps> {
        return {
            id:         this.id,
            quarter:    this.quarter
        }
    }    

    async getStaticProps() : Promise<PerformanceStaticProps> {
        return {
            collaborators:      this.collaborators,
            concerts:           await Promise.all(this.concerts.map(async (c) => c.getStaticProps())),
            descriptionMDX:     await mdxSerializeMarkdown(this.description),
            directors:          this.directors,
            dressRehearsals:    await Promise.all(this.dressRehearsals.map(async (dr) => dr.getStaticProps())),
            events:             await Promise.all(this.events.map(async (e) => e.getStaticProps())),
            galleries:          await Promise.all(this.galleries.map(async (g) => await g.getRefStaticProps())),
            heraldImageRoutes:  imageRoutesStaticProps(this.heraldImageRoutes),
            id:                 this.id,
            instructors:        this.instructors,
            mainPieces:         await Promise.all(this.mainPieces.map(pieceStaticProps)),
            membershipLimit:    this.membershipLimit,
            posterRoutes:       imageRoutesStaticProps(this.posterRoutes),
            preregisterDate:    this.preregisterDate?.toISO() || null,
            quarter:            this.quarter,
            registrationFee:    this.registrationFee,
            repertoire:         await Promise.all(this.repertoire.map(pieceStaticProps)),
            sectionalsSopranoAlto:  await Promise.all(this.sectionalsSopranoAlto.map(async (r) => r.getStaticProps())),
            sectionalsTenorBass:    await Promise.all(this.sectionalsTenorBass.map(async (r) => r.getStaticProps())),
            soloists:               await Promise.all(this.soloists.map(async (s) => s.getStaticProps())),
            supplementsMDX:         await Promise.all(this.supplements.map((s) => mdxSerializeMarkdown(s))),
            syllabusRoutes:         fileRoutesStaticProps(this.syllabusRoutes),
            tuttiRehearsals:        await Promise.all(this.tuttiRehearsals.map(async (r) => r.getStaticProps())),
        };
    }

    static async deserialize(data : SerializedPerformance, model : Model) : Promise<Performance> {
        const addRehearsalSequences = (sequences : SerializedRehearsalSequence[], rehearsals : Rehearsal[]) => {
            sequences.forEach((s) => rehearsals.push(...Rehearsal.deserializeSequence(s)));
            rehearsals.sort((a, b) => -compareDateTime(a.start, b.start));
        }

        const result = new Performance(data.quarter,
                                       data.syllabus,
                                       data.directors,
                                       data.instructors,
                                       data.collaborators,
                                       data.description,
                                       (data.preregister ? DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone }) : null),
                                       data.registrationFee,
                                       data.membershipLimit);
    
        if (data.soloists) {
            result.soloists.push(...await Promise.all(data.soloists.map(async (s) => Soloist.deserialize(s))));
        }
    
        data.concerts.forEach((c) => {
            result.concerts.push(...data.concerts.map((c) => new Concert(createDateTime(c.date, c.start), c.location, createDateTime(c.date, c.call))));
            result.concerts.sort((a, b) => -compareDateTime(a.start, b.start));
        });
    
        if (data.repertoire.main) {
            data.repertoire.main.forEach((p) => NotedPerformance.deserializePieceForPerformance(p, result, true, model.repertoire));
        }
        if (data.repertoire.other) {
            data.repertoire.other.forEach((p) => NotedPerformance.deserializePieceForPerformance(p, result, false, model.repertoire));
        }
    
        if (data.poster) {
            result.setPoster(data.poster.basename, data.poster.caption);
        }
        if (data.heraldImage) {
            result.setHeraldImage(data.heraldImage.basename, data.heraldImage.caption);
        }
    
        if (data.events) {
            result.events.push(...data.events.map((e) => new GenericEvent(createDateTime(e.date, e.start), e.location, e.title)));
            result.events.sort((a, b) => -compareDateTime(a.start, b.start));
        }
    
        if (data.tuttiRehearsals) {
            addRehearsalSequences(data.tuttiRehearsals, result.tuttiRehearsals);
        }
    
        if (data.tuttiRehearsalNotes) {
            data.tuttiRehearsalNotes.forEach((note) => {
                const noteDateTime : DateTime = createDateTime(note.date, '00:00');
                const rehearsal : Rehearsal = result.tuttiRehearsals.find((e) => (e.start.year == noteDateTime.year &&
                                                                                  e.start.month == noteDateTime.month &&
                                                                                  e.start.day == noteDateTime.day));
                if (!rehearsal) throw new Error(util.format('Cannot find tuttiRehearsal on date "%s" to attach a note', note.date));
                
                rehearsal.notes.push(note.note);
            });
        }
    
        if (data.mensSectionals) {
            // TODO: change yml schema from mensSectionals to sectionalsTenorBass
            addRehearsalSequences(data.mensSectionals, result.sectionalsTenorBass);
        }
    
        if (data.womensSectionals) {
            // TODO: change yml schema from womensSectionals to sectionalsSopranoAlto
            addRehearsalSequences(data.womensSectionals, result.sectionalsSopranoAlto);
        }
    
        if (data.dressRehearsals) {
            result.dressRehearsals.push(...data.dressRehearsals.map((dr) => new DressRehearsal(createDateTime(dr.date, dr.start), dr.location)));
            result.dressRehearsals.sort((a, b) => -compareDateTime(a.start, b.start));
        }
    
        if (data.supplements) {
            result.supplements.push(...data.supplements);
        }
    
        model.addPerformance(result);
    
        return result;
    }
}
