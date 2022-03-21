import { ConcertEvent, ConcertEventStaticProps, SerializedConcertEvent } from './concertEvent';
import { createDateTime, compareDateTime } from './dateTimeUtils';
import { DressRehearsalEvent, DressRehearsalEventStaticProps, SerializedDressRehearsalEvent } from './dressRehearsalEvent';
import { BasicEvent, GenericEvent, GenericEventStaticProps, SerializedGenericEvent } from './event';
import { FileRoutes, fileRoutesStaticProps, FileRouteStaticProp, ImageRoutes, ImageRoutesStaticProps } from './fileRoutes';
import { Gallery, GalleryRefStaticProps } from './gallery'
import { PerformancePiece } from './performancePiece'
import { PerformanceRepertoire, PerformanceRepertoireStaticProps, SerializedPerformanceRepertoire } from './performanceRepertoire';
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

type SerializedPoster = {
    basename : string;
    caption? : string;
}

type SerializedRehearsalNote = {
    date : string;  // 'YYYY-MM-DD' : date of the rehearsal for which the note applies
    note : string;
}

type RehearsalNote = SerializedRehearsalNote;

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
    concerts : SerializedConcertEvent[];
    repertoire : SerializedPerformanceRepertoire;
    events? : SerializedGenericEvent[];
    tuttiRehearsals : SerializedRehearsalSequence[];
    tuttiRehearsalNotes? : SerializedRehearsalNote[];
    mensSectionals? : SerializedRehearsalSequence[];
    womensSectionals? : SerializedRehearsalSequence[];
    dressRehearsals? : SerializedDressRehearsalEvent[];
}

export type PerformanceRefStaticProps = {
    id : string;
    quarter : string;
}

export type PerformanceStaticProps = {
    collaborators :         string[];
    concerts :              ConcertEventStaticProps[];
    descriptionMDX :        MDXRemoteSerializeResult;
    directors :             string[];
    dressRehearsals :       DressRehearsalEventStaticProps[];
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

function appendEvents<T extends BasicEvent>(original : readonly T[], addend : T[]) : T[] {
    return original.concat(addend)
                   .sort((a, b) => -compareDateTime(a.start, b.start));
}

export class Performance {
    readonly collaborators          : readonly string[]                 = [];
    readonly concerts               : readonly ConcertEvent[]           = [];
    readonly description            : string;
    readonly directors              : readonly string[]                 = [];
    readonly dressRehearsals        : readonly DressRehearsalEvent[]    = [];
    readonly events                 : readonly GenericEvent[]           = [];
    readonly galleries              : Gallery[]                         = [];
    readonly instructors            : readonly string[]                 = [];
    readonly membershipLimit        : number;
    readonly preregisterDate        : DateTime;
    readonly practiceFiles          : readonly PracticeFileSection[]    = [];
    readonly quarter                : string                            = '';
    readonly registrationFee        : string;
    readonly rehearsalPieces        : PerformancePiece[]                = [];
    readonly repertoire             : PerformanceRepertoire;
    readonly sectionalsSopranoAlto  : readonly Rehearsal[]              = [];
    readonly sectionalsTenorBass    : readonly Rehearsal[]              = [];
    readonly soloists               : readonly Soloist[]                = [];
    readonly supplements            : string[]                          = [];
    readonly syllabusRoutes         : FileRoutes;
    readonly tuttiRehearsals        : readonly Rehearsal[]              = [];

    private _posterRoutes           : ImageRoutes;
    private _heraldImageRoutes      : ImageRoutes;

    private constructor(quarter : string,
                        syllabusName : string,
                        directors : string[],
                        instructors : string[],
                        collaborators : string[],
                        description : string,
                        preregisterDate : DateTime,
                        registrationFee : string,
                        membershipLimit : number,
                        repertoire : PerformanceRepertoire,
                        soloists : Soloist[],
                        concerts : ConcertEvent[],
                        tuttiRehearsals : Rehearsal[],
                        sectionalsSopranoAlto : Rehearsal[],
                        sectionalsTenorBass : Rehearsal[],
                        dressRehearsals : DressRehearsalEvent[],
                        tuttiRehearsalNotes : RehearsalNote[],
                        practiceFiles : PracticeFileSection[],
                        events : GenericEvent[]) {
        if (syllabusName) {
            // TODO : '/assets/syllabi' should not be a literal constant
            this.syllabusRoutes = new FileRoutes('/assets/syllabi', syllabusName, ['pdf', 'docx', 'doc'])
            if (0 == this.syllabusRoutes.routes.length) {
                throw new Error(`No syllabi variants found for "${syllabusName}"`);
            }
        }

        this.concerts = appendEvents(this.concerts, concerts);
        this.dressRehearsals = appendEvents(this.dressRehearsals, dressRehearsals);
        this.events = appendEvents(this.events, events);
        this.sectionalsSopranoAlto = appendEvents(this.sectionalsSopranoAlto, sectionalsSopranoAlto);
        this.sectionalsTenorBass = appendEvents(this.sectionalsTenorBass, sectionalsTenorBass);
        this.tuttiRehearsals = appendEvents(this.tuttiRehearsals, tuttiRehearsals);

        this.collaborators = this.collaborators.concat(collaborators);
        this.description = (description || '');
        this.directors = this.directors.concat(directors);
        this.instructors = this.instructors.concat(instructors);
        this.membershipLimit = membershipLimit;
        this.practiceFiles = this.practiceFiles.concat(practiceFiles);
        this.preregisterDate = preregisterDate;
        this.quarter = quarter;
        this.registrationFee = registrationFee;
        this.repertoire = repertoire;
        this.soloists = this.soloists.concat(soloists);

        this.repertoire.full.forEach((p) => p.piece.addPerformance(this));
    
        tuttiRehearsalNotes.forEach((note) => {
            const noteDateTime : DateTime = createDateTime(note.date, '00:00');
            const rehearsal : Rehearsal = this.tuttiRehearsals.find((e) => (e.start.year == noteDateTime.year &&
                                                                            e.start.month == noteDateTime.month &&
                                                                            e.start.day == noteDateTime.day));
            assert.ok(rehearsal, `Cannot find tuttiRehearsal on date "${note.date}" to attach a note`);
            
            rehearsal.notes.push(note.note);
        });

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
            collaborators:          this.collaborators.concat([]),
            concerts:               await Promise.all(this.concerts.map(async (c) => c.getStaticProps())),
            descriptionMDX:         await mdxSerializeMarkdown(this.description),
            directors:              this.directors.concat([]),
            dressRehearsals:        await Promise.all(this.dressRehearsals.map((dr) => dr.getStaticProps())),
            events:                 await Promise.all(this.events.map(async (e) => e.getStaticProps())),
            galleries:              await Promise.all(this.galleries.map(async (g) => await g.getRefStaticProps())),
            heraldImageRoutes:      this._heraldImageRoutes ? await this._heraldImageRoutes.getStaticProps() : null,
            id:                     this.id,
            instructors:            this.instructors.concat([]),
            membershipLimit:        this.membershipLimit,
            posterRoutes:           this._posterRoutes ? await this._posterRoutes.getStaticProps() : null,
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

    static async deserialize(data : SerializedPerformance) : Promise<Performance> {
        const result = new Performance(data.quarter,
                                       data.syllabus,
                                       data.directors || [],
                                       data.instructors || [],
                                       data.collaborators || [],
                                       data.description,
                                       (data.preregister ? DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone }) : null),
                                       data.registrationFee,
                                       data.membershipLimit,
                                       await PerformanceRepertoire.deserialize(data.repertoire),
                                       data.soloists ? await Promise.all(data.soloists.map(async (s) => Soloist.deserialize(s))) : [],
                                       await Promise.all(data.concerts.map(async (c) => ConcertEvent.deserialize(c))),
                                       data.tuttiRehearsals ? (await Promise.all(data.tuttiRehearsals.map((s) => Rehearsal.deserializeSequence(s)))).flat() : [],
                                       // TODO: change yml schema from womensSectionals to sectionalsSopranoAlto
                                       data.womensSectionals ? (await Promise.all(data.womensSectionals.map((s) => Rehearsal.deserializeSequence(s)))).flat() : [],
                                       // TODO: change yml schema from mensSectionals to sectionalsTenorBass
                                       data.mensSectionals ? (await Promise.all(data.mensSectionals.map((s) => Rehearsal.deserializeSequence(s)))).flat() : [],
                                       data.dressRehearsals ? await Promise.all(data.dressRehearsals.map((dr) => DressRehearsalEvent.deserialize(dr))) : [],
                                       data.tuttiRehearsalNotes || [],
                                       data.practiceFiles ? await Promise.all(data.practiceFiles.map((p) => PracticeFileSection.deserialize(p))) : [],
                                       data.events ? await Promise.all(data.events.map((e) => GenericEvent.deserialize(e))) : []);

        if (data.poster) {
            result.setPoster(data.poster.basename, data.poster.caption);
        }
        if (data.heraldImage) {
            result.setHeraldImage(data.heraldImage.basename, data.heraldImage.caption);
        }
    
        if (data.supplements) {
            result.supplements.push(...data.supplements);
        }
        
        return result;
    }
}
