import { createDateTime, compareDateTime } from './dateTimeUtils';
import { FileRoutes, fileRoutesStaticProps, FileRouteStaticProp, ImageRoutes, ImageRoutesStaticProps, imageRoutesStaticProps } from './fileRoutes';
import { Gallery, GalleryRefStaticProps } from './gallery'
import { Model } from './model'
import { PerformancePiece, PerformancePieceStaticProps, SerializedPerformancePiece } from './performancePiece'
import { PracticeFileSection, PracticeFileSectionStaticProps, SerializedPracticeFileSection  } from './practiceFiles';
import { Rehearsal, RehearsalStaticProps, SerializedRehearsalSequence } from './rehearsal'
import { Soloist, SoloistStaticProps, SerializedSoloist } from './soloist'
import { makeSlug } from './slug';

import { DateTime } from 'luxon';
import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

import getConfig from 'next/config'

import { strict as assert } from 'assert';

const { serverRuntimeConfig } = getConfig()

export type SerializedPerformanceRepertoire = {
    main :      SerializedPerformancePiece[];
    other? :    SerializedPerformancePiece[];
}

export type PerformanceRepertoireStaticProps = {
    main :  PerformancePieceStaticProps[];
    full :  PerformancePieceStaticProps[];
}

export class PerformanceRepertoire {
    readonly main : PerformancePiece[]  = []
    readonly full : PerformancePiece[]  = []

    private constructor(main : PerformancePiece[], other? : PerformancePiece[]) {
        this.main.push(...main);
        this.full.push(...main);

        if (other) {
            this.full.push(...other);
        }
    }

    async getStaticProps() : Promise<PerformanceRepertoireStaticProps> {
        return {
            main:   await Promise.all(this.main.map((p) => p.getStaticProps())),
            full:   await Promise.all(this.full.map((p) => p.getStaticProps())),
        }
    }

    static async deserialize(data : SerializedPerformanceRepertoire) : Promise<PerformanceRepertoire> {
        const main = await Promise.all(data.main.map((p) => PerformancePiece.deserialize(p)));
        
        const other = [];
        if (data.other) {
            other.push(...await Promise.all(data.other.map((p) => PerformancePiece.deserialize(p))));
        }

        return new PerformanceRepertoire(main, other);
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
    call :          string;  // 'HH:MM' : 24-hour formatted call time for the concert
    repertoire? :   SerializedPerformanceRepertoire;
}

export type ConcertStaticProps = BasicEventStaticProps & {
    call :          string;  // ISO time
    repertoire :    PerformanceRepertoireStaticProps;
}

export class Concert extends BasicEvent {
    readonly call :         DateTime;
    readonly repertoire :   PerformanceRepertoire;

    private constructor(start : DateTime, location : string, call : DateTime, repertoire : PerformanceRepertoire) {
        super(start, location);
        this.call = call;
        this.repertoire = repertoire;
    }

    async getStaticProps() : Promise<ConcertStaticProps> {    
        return {
            ...await super.getStaticProps(),

            call:       this.call.toISO(),
            repertoire: this.repertoire ? await this.repertoire.getStaticProps() : null,
        };
    }

    static async deserialize(data : SerializedConcert) : Promise<Concert> {
        return new Concert(createDateTime(data.date, data.start), data.location,
                           createDateTime(data.date, data.call),
                           data.repertoire ? await PerformanceRepertoire.deserialize(data.repertoire) : null);
    }
}

export type SerializedDressRehearsal = SerializedBasicEvent & {
    repertoire? :   SerializedPerformanceRepertoire;
}

export type DressRehearsalStaticProps = BasicEventStaticProps & {
    repertoire :    PerformanceRepertoireStaticProps;
}

export class DressRehearsal extends BasicEvent {
    readonly repertoire :   PerformanceRepertoire;

    private constructor(start : DateTime, location : string, repertoire : PerformanceRepertoire) {
        super(start, location);
        this.repertoire = repertoire;
    }

    async getStaticProps() : Promise<DressRehearsalStaticProps> {    
        return {
            ...await super.getStaticProps(),

            repertoire: this.repertoire ? await this.repertoire.getStaticProps() : null,
        };
    }

    static async deserialize(data : SerializedDressRehearsal) : Promise<DressRehearsal> {
        return new DressRehearsal(createDateTime(data.date, data.start), data.location,
                                  data.repertoire ? await PerformanceRepertoire.deserialize(data.repertoire) : null);
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
    practiceFiles? : SerializedPracticeFileSection[];
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
    repertoire : SerializedPerformanceRepertoire;
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
    dressRehearsals :       DressRehearsalStaticProps[];
    events :                GenericEventStaticProps[];
    galleries :             GalleryRefStaticProps[];
    heraldImageRoutes :     ImageRoutesStaticProps;
    id :                    string;
    instructors :           string[];
    membershipLimit :       number;
    posterRoutes :          ImageRoutesStaticProps;
    practiceFiles :         PracticeFileSectionStaticProps[];
    preregisterDate :       string;   // ISO date-time
    quarter :               string;
    registrationFee :       string;
    repertoire :            PerformanceRepertoireStaticProps;
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
    readonly galleries : Gallery[]                  = [];
    readonly instructors : string[]                 = [];
    readonly membershipLimit : number;
    readonly preregisterDate : DateTime;
    readonly practiceFiles : PracticeFileSection[]  = [];
    readonly quarter : string                       = '';
    readonly registrationFee : string;
    readonly rehearsalPieces : PerformancePiece[]   = [];
    readonly repertoire : PerformanceRepertoire;
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
                        repertoire : PerformanceRepertoire) {
        this.quarter = quarter;

        if (syllabusName) {
            // TODO : '/assets/syllabi' should not be a literal constant
            this.syllabusRoutes = new FileRoutes('/assets/syllabi', syllabusName, ['pdf', 'docx', 'doc'])
            if (0 == this.syllabusRoutes.routes.length) {
                throw new Error(`No syllabi variants found for "${syllabusName}"`);
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
        this.repertoire = repertoire;
    }

    get id() { return makeSlug(this.quarter); }
    get firstConcert() { return (0 < this.concerts.length ? this.concerts[0] : null); }
    get posterRoutes() { return this._posterRoutes; }
    get heraldImageRoutes() { return this._heraldImageRoutes; }

    compare(other : Performance) {
        let result = 0;

        if (0 == result) {
            result = compareDateTime(other.firstConcert.start, this.firstConcert.start);
        }
        if (0 == result) {
            result = compareDateTime(other.tuttiRehearsals[0].start, this.tuttiRehearsals[0].start);
        }

        return result;
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
            dressRehearsals:        await Promise.all(this.dressRehearsals.map((dr) => dr.getStaticProps())),
            events:                 await Promise.all(this.events.map(async (e) => e.getStaticProps())),
            galleries:              await Promise.all(this.galleries.map(async (g) => await g.getRefStaticProps())),
            heraldImageRoutes:      imageRoutesStaticProps(this.heraldImageRoutes),
            id:                     this.id,
            instructors:            this.instructors,
            membershipLimit:        this.membershipLimit,
            posterRoutes:           imageRoutesStaticProps(this.posterRoutes),
            practiceFiles:          await Promise.all(this.practiceFiles.map((p) => p.getStaticProps())),
            preregisterDate:        this.preregisterDate?.toISO() || null,
            quarter:                this.quarter,
            registrationFee:        this.registrationFee,
            repertoire:             await this.repertoire.getStaticProps(),
            sectionalsSopranoAlto:  await Promise.all(this.sectionalsSopranoAlto.map(async (r) => r.getStaticProps())),
            sectionalsTenorBass:    await Promise.all(this.sectionalsTenorBass.map(async (r) => r.getStaticProps())),
            soloists:               await Promise.all(this.soloists.map(async (s) => s.getStaticProps())),
            supplementsMDX:         await Promise.all(this.supplements.map((s) => mdxSerializeMarkdown(s))),
            syllabusRoutes:         fileRoutesStaticProps(this.syllabusRoutes),
            tuttiRehearsals:        await Promise.all(this.tuttiRehearsals.map(async (r) => r.getStaticProps())),
        };
    }

    static async deserialize(data : SerializedPerformance, model : Model) : Promise<Performance> {
        // TODO : deserialize practiceFiles

        const addRehearsalSequences = (sequences : SerializedRehearsalSequence[], rehearsals : Rehearsal[]) => {
            sequences.forEach((s) => rehearsals.push(...Rehearsal.deserializeSequence(s)));
            rehearsals.sort((a, b) => -compareDateTime(a.start, b.start));
        }

        const repertoire = await PerformanceRepertoire.deserialize(data.repertoire);

        const result = new Performance(data.quarter,
                                       data.syllabus,
                                       data.directors,
                                       data.instructors,
                                       data.collaborators,
                                       data.description,
                                       (data.preregister ? DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone }) : null),
                                       data.registrationFee,
                                       data.membershipLimit,
                                       repertoire);
    
        if (data.soloists) {
            result.soloists.push(...await Promise.all(data.soloists.map(async (s) => Soloist.deserialize(s))));
        }
    
        result.concerts.push(...await Promise.all(data.concerts.map(async (c) => Concert.deserialize(c))));
        result.concerts.sort((a, b) => -compareDateTime(a.start, b.start));
    
        repertoire.full.forEach((p) => {
            assert.ok(p.piece === model.repertoire.addPiece(p.piece), `model.repertoire detected a piece collision`); // TODO : remove Repertoire
            p.piece.addPerformance(result);
        });
                            

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
                if (!rehearsal) throw new Error(`Cannot find tuttiRehearsal on date "${note.date}" to attach a note`);
                
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
            result.dressRehearsals.push(...await Promise.all(data.dressRehearsals.map((dr) => DressRehearsal.deserialize(dr))));
            result.dressRehearsals.sort((a, b) => -compareDateTime(a.start, b.start));
        }
    
        if (data.practiceFiles) {
            result.practiceFiles.push(...await Promise.all(data.practiceFiles.map((p) => PracticeFileSection.deserialize(p))));
        }

        if (data.supplements) {
            result.supplements.push(...data.supplements);
        }
    
        model.addPerformance(result);
    
        return result;
    }
}
