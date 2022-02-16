import { createDateTime, compareDateTime } from './dateTimeUtils';
import { FileRoutes, fileRoutesStaticProps, FileRouteStaticProp, ImageRoutes, ImageRoutesStaticProps, imageRoutesStaticProps } from './fileRoutes';
import { Gallery, GalleryRefStaticProps } from './gallery'
import { Model } from './model'
import { PerformancePiece, PerformancePieceStaticProps, SerializedPerformancePiece } from './performancePiece'
import { Rehearsal, RehearsalStaticProps, SerializedRehearsalSequence } from './rehearsal'
import { Soloist, SoloistStaticProps, SerializedSoloist } from './soloist'
import { makeSlug } from './slug';

import { DateTime } from 'luxon';
import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

import getConfig from 'next/config'

import { strict as assert } from 'assert';
import util from 'util';

const { serverRuntimeConfig } = getConfig()

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

export type SerializedFutureWork = {
    concerts? :         SerializedConcert[];
    dressRehearsals? :  SerializedDressRehearsal[];
    repertoire :        SerializedPerformancePiece[];
}

export type FutureWorkStaticProps = {
    concerts :          ConcertStaticProps[];
    dressRehearsals :   BasicEventStaticProps[];
    repertoire :        PerformancePieceStaticProps[];
}

export class FutureWork {
    readonly concerts :         Concert[]           = [];
    readonly dressRehearsals :  DressRehearsal[]    = [];
    readonly repertoire :       PerformancePiece[]  = [];

    private constructor() {

    }

    async getStaticProps() : Promise<FutureWorkStaticProps> {
        return {
            concerts:           await Promise.all(this.concerts.map(async (c) => c.getStaticProps())),
            dressRehearsals:    await Promise.all(this.dressRehearsals.map(async (dr) => dr.getStaticProps())),
            repertoire:         await Promise.all(this.repertoire.map(async (p) => p.getStaticProps())),
        };
    }

    static async deserialize(data : SerializedFutureWork) : Promise<FutureWork> {
        const result = new FutureWork();
    
        if (data.concerts) {
            result.concerts.push(...data.concerts.map((c) => new Concert(createDateTime(c.date, c.start), c.location, createDateTime(c.date, c.call))));
            result.concerts.sort((a, b) => -compareDateTime(a.start, b.start));
        }
    
        const pieces = await Promise.all(data.repertoire.map(async (p) => PerformancePiece.deserialize(p)));
        result.repertoire.push(...pieces);
    
        if (data.dressRehearsals) {
            result.dressRehearsals.push(...data.dressRehearsals.map((dr) => new DressRehearsal(createDateTime(dr.date, dr.start), dr.location)));
            result.dressRehearsals.sort((a, b) => -compareDateTime(a.start, b.start));
        }

        return result;
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
    futureWork: SerializedFutureWork;
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
    collaborators :         string[];
    concerts :              ConcertStaticProps[];
    descriptionMDX :        MDXRemoteSerializeResult;
    directors :             string[];
    dressRehearsals :       BasicEventStaticProps[];
    events :                GenericEventStaticProps[];
    futureWork :            FutureWorkStaticProps;
    galleries :             GalleryRefStaticProps[];
    heraldImageRoutes :     ImageRoutesStaticProps;
    id :                    string;
    instructors :           string[];
    mainPieces :            PerformancePieceStaticProps[];
    membershipLimit :       number;
    posterRoutes :          ImageRoutesStaticProps;
    preregisterDate :       string;   // ISO date-time
    quarter :               string;
    registrationFee :       string;
    repertoire :            PerformancePieceStaticProps[];
    sectionalsSopranoAlto : RehearsalStaticProps[];
    sectionalsTenorBass :   RehearsalStaticProps[];
    soloists :              SoloistStaticProps[];
    supplementsMDX :        MDXRemoteSerializeResult[];
    syllabusRoutes :        FileRouteStaticProp[];
    tuttiRehearsals :       RehearsalStaticProps[];
}

export class Performance {
    readonly collaborators : string[]               = [];
    readonly concerts : Concert[]                   = [];
    readonly description : string;
    readonly directors : string[]                   = [];
    readonly dressRehearsals : DressRehearsal[]     = [];
    readonly events : GenericEvent[]                = [];
    readonly futureWork : FutureWork;
    readonly galleries : Gallery[]                  = [];
    readonly instructors : string[]                 = [];
    readonly mainPieces : PerformancePiece[]        = [];
    readonly membershipLimit : number;
    readonly preregisterDate : DateTime;
    readonly quarter : string                       = '';
    readonly registrationFee : string;
    readonly rehearsalPieces : PerformancePiece[]   = [];
    readonly repertoire : PerformancePiece[]        = [];
    readonly sectionalsSopranoAlto : Rehearsal[]    = [];
    readonly sectionalsTenorBass : Rehearsal[]      = [];
    readonly soloists : Soloist[]                   = [];
    readonly supplements : string[]                 = [];
    readonly syllabusRoutes : FileRoutes;
    readonly tuttiRehearsals : Rehearsal[]          = [];

    private _posterRoutes : ImageRoutes;
    private _heraldImageRoutes : ImageRoutes;

    private constructor(quarter : string,
                        syllabusName : string,
                        directors : string[],
                        instructors : string[],
                        collaborators : string[],
                        description : string,
                        preregisterDate : DateTime,
                        registrationFee : string,
                        membershipLimit : number,
                        futureWork : FutureWork) {
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
        this.futureWork = futureWork;
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
            collaborators:          this.collaborators,
            concerts:               await Promise.all(this.concerts.map(async (c) => c.getStaticProps())),
            descriptionMDX:         await mdxSerializeMarkdown(this.description),
            directors:              this.directors,
            dressRehearsals:        await Promise.all(this.dressRehearsals.map(async (dr) => dr.getStaticProps())),
            events:                 await Promise.all(this.events.map(async (e) => e.getStaticProps())),
            futureWork:             (this.futureWork ? await this.futureWork.getStaticProps() : null),
            galleries:              await Promise.all(this.galleries.map(async (g) => await g.getRefStaticProps())),
            heraldImageRoutes:      imageRoutesStaticProps(this.heraldImageRoutes),
            id:                     this.id,
            instructors:            this.instructors,
            mainPieces:             await Promise.all(this.mainPieces.map(async (p) => p.getStaticProps())),
            membershipLimit:        this.membershipLimit,
            posterRoutes:           imageRoutesStaticProps(this.posterRoutes),
            preregisterDate:        this.preregisterDate?.toISO() || null,
            quarter:                this.quarter,
            registrationFee:        this.registrationFee,
            repertoire:             await Promise.all(this.repertoire.map(async (p) => p.getStaticProps())),
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
                                       data.membershipLimit,
                                       data.futureWork ? await FutureWork.deserialize(data.futureWork) : null);
    
        if (data.soloists) {
            result.soloists.push(...await Promise.all(data.soloists.map(async (s) => Soloist.deserialize(s))));
        }
    
        result.concerts.push(...data.concerts.map((c) => new Concert(createDateTime(c.date, c.start), c.location, createDateTime(c.date, c.call))));
        result.concerts.sort((a, b) => -compareDateTime(a.start, b.start));
    
        if (data.repertoire.main) {
            const pieces = await Promise.all(data.repertoire.main.map(async (p) => PerformancePiece.deserialize(p)));
            pieces.forEach((p) => {
                assert.ok(p.piece === model.repertoire.addPiece(p.piece), `model.repertoire detected a piece collision`); // TODO : remove Repertoire
                p.piece.addPerformance(result)
            });
            result.mainPieces.push(...pieces);
            result.repertoire.push(...pieces);
        }
        if (data.repertoire.other) {
            const pieces = await Promise.all(data.repertoire.other.map(async (p) => PerformancePiece.deserialize(p)));
            pieces.forEach((p) => {
                assert.ok(p.piece === model.repertoire.addPiece(p.piece), `model.repertoire detected a piece collision`); // TODO : remove Repertoire
                p.piece.addPerformance(result)
            });
            result.repertoire.push(...pieces);
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
