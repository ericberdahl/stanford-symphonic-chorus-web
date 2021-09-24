import { IPiece, Piece, NotedPerformance, IComposer, Composer } from './piece'

import imageSize from 'image-size'
import { DateTime } from 'luxon';

import slugify from 'slugify'

import fs from 'fs';
import path from 'path';
import process from 'process';
import util from 'util';

enum FrequencyEnum {
    weekly = 'weekly',
    once = 'once'
}

type RehearsalSequenceDataField = {
    frequency? : FrequencyEnum;
    startDate : string; // 'YYYY-MM-DD' : date on which the first rehearsal will occur
    endDate? : string;  // 'YYYY-MM-DD' : if present, date on which the last rehearsal will occur. Required unless frequence is 'once'
    startTime: string;  // 'HH:MM' : 24-hour formatted time at which rehearsals start
    endTime: string;    // 'HH:MM' : 24-hour formatted time at which rehearsals end
    location: string    // nickname of the location at which rehearsals are held
};

class Rehearsal {
    readonly start : DateTime;
    readonly end : DateTime;
    readonly location : string;
    readonly notes : string[] = [];

    constructor(start : DateTime, end : DateTime, location : string) {
        this.start = start;
        this.end = end;
        this.location = (location || '');
    }

    addNote(note : string) : void {
        this.notes.push(note);
    }
}

function createDateTime(date : string, timeOfDay : string, timezone : string) : DateTime {
    return DateTime.fromFormat(date + ' ' + timeOfDay, 'yyyy-MM-dd HH:mm', { setZone: timezone });
}

function createRehearsalSequence(spec : RehearsalSequenceDataField, timezone : string) : Rehearsal[] {
    const frequency : FrequencyEnum = (spec.frequency ? spec.frequency : FrequencyEnum.once);

    const computeDateShift = (f : string) => {
        if (FrequencyEnum.once == f) return { days: 1 };
        if (FrequencyEnum.weekly == f) return { days: 7 };
        throw new Error(util.format('Unkonwn frequency "%s"', f));
    }
    const dateShift = computeDateShift(frequency);

    if (FrequencyEnum.once != frequency && !spec.endDate) {
        throw new Error(util.format('Event sequences with "%s" frequency require an endDate', frequency));
    }
    const endDate : string = (spec.endDate ? spec.endDate : spec.startDate);
    const finalStartDateTime : DateTime = createDateTime(endDate, spec.startTime, timezone);

    var nextStartDateTime : DateTime = createDateTime(spec.startDate, spec.startTime, timezone);
    var nextEndDateTime : DateTime = createDateTime(spec.startDate, spec.endTime, timezone);

    var result : Rehearsal[] = [];
    do {
        result.push(new Rehearsal(nextStartDateTime, nextEndDateTime, spec.location));

        nextStartDateTime = nextStartDateTime.plus(dateShift);
        nextEndDateTime = nextEndDateTime.plus(dateShift);
    } while(finalStartDateTime.diff(nextStartDateTime).toMillis() >= 0);

    return result;
}

function parseTuttiRehearsalNote(note : RehearsalNoteDataField, tuttiRehearsals : Rehearsal[], timezone : string) {
    const noteDateTime : DateTime = createDateTime(note.date, '00:00', timezone);
    const rehearsal : Rehearsal = tuttiRehearsals.find((e) => (e.start.year == noteDateTime.year && e.start.month == noteDateTime.month && e.start.day == noteDateTime.day));
    if (!rehearsal) throw new Error(util.format('Cannot find tuttiRehearsal on date "%s" to attach a note', note.date));
    
    rehearsal.addNote(note.note);
}

function composeExistingRoute(directoryRoute : string, name : string, extension : string) {
    const route = path.normalize(path.format({
        dir: directoryRoute,
        name: name,
        ext: extension.toLowerCase()
    }));

    return (fs.existsSync(path.join(process.cwd(), 'public', route)) ? route : null);
}

class ImageRoutes {
    readonly pdf : string;
    readonly jpg : string;
    readonly caption : string;
    readonly width : number     = 0;
    readonly height : number    = 0;

    constructor(directoryRoute : string, name : string, caption : string) {
        const publicDir = path.join(process.cwd(), 'public');

        this.pdf = composeExistingRoute(directoryRoute, name, '.pdf');
        this.jpg = composeExistingRoute(directoryRoute, name, '.jpg');

        if (!this.pdf && !this.jpg) {
            throw new Error(util.format('No image variants found for "%s"', name));
        }

        if (this.jpg) {
            const imagePath = path.join(publicDir, this.jpg);
            ({ width: this.width, height: this.height } = imageSize(imagePath));
        }
    
        this.caption = caption;
    }
}

// TODO: Move performance yaml data parsing into its own module. Don't democratize the yaml-deserialization code

type ComposerDataField = string | Array<string>;

type PieceDataField = {
    title : string;
    composer? : ComposerDataField;
    movement? : string;
    translation? : string;
    commonTitle? : string;
    catalog? : string;
    arranger? : string;
    prefix? : string;
    suffix? : string;
    performanceNote? : string;
}

type BasicEvent = {
    start : DateTime;
    location : string;
};

type Concert = BasicEvent & {
    call : DateTime;
}

type GenericEvent = BasicEvent & {
    title : string;
}

type DressRehearsal = BasicEvent;

type PosterDataField = {
    basename : string;
    caption? : string;
}

type SoloistDataField = {
    name : string;
    part : string;
}

interface ISoloist {
    readonly name : string;
    readonly part : string;
}

type RehearsalNoteDataField = {
    date : string;  // 'YYYY-MM-DD' : date of the rehearsal for which the note applies
    note : string;
}

type BaseEventDataField = {
    date : string;      // 'YYYY-MM-DD' : date of the event
    start : string;     // 'HH:MM' : 24-hour formatted start time of the event
    location : string;  // nickname of the location of the event
}

type EventDataField = BaseEventDataField & {
    title : string;
}

type ConcertDataField = BaseEventDataField & {
    call : string;  // 'HH:MM' : 24-hour formatted call time for the concert
}

type DressRehearsalDataField = BaseEventDataField;

type PerformanceDataField = {
    quarter : string;           // human-readable name of quarter
    syllabus : string;          // basename of syllabus asset
    directors : string[];       // list of names of the directors
    instructors : string[];     // list of names of the instructors
    collaborators : string[];   // list of nicknames of collaborators
    soloists : SoloistDataField[];
    poster? : PosterDataField;
    heraldImage? : PosterDataField;
    description : string;       // HTML to be displayed as a description of the performance being prepared, often on the home page
    preregister : string;       // 'YYYY-MM-DD' : date the preregistration mail is expected to be sent
    registrationFee : string;   // '$dd' : amount of the registration fee
    membershipLimit : number;
    concerts : ConcertDataField[];
    repertoire : {
        main: PieceDataField[];
        other: PieceDataField[];
    };
    events : EventDataField[];
    tuttiRehearsals : RehearsalSequenceDataField[];
    tuttiRehearsalNotes : RehearsalNoteDataField[];
    mensSectionals : RehearsalSequenceDataField[];
    womensSectionals : RehearsalSequenceDataField[];
    dressRehearsals : DressRehearsalDataField[];
}


export default class Performance {
    readonly collaborators : string[]               = [];
    readonly concerts : Concert[]                   = [];
    readonly description : string;
    readonly directors : string[]                   = [];
    readonly dressRehearsals : DressRehearsal[]     = [];
    readonly events : GenericEvent[]                = [];
    readonly heraldImageRoutes : ImageRoutes;
    readonly instructors : string[]                 = [];
    readonly mainPieces : IPiece[]                  = [];
    readonly membershipLimit : number;
    readonly posterRoutes : ImageRoutes;
    readonly preregisterDate : DateTime;
    readonly quarter : string                       = '';
    readonly registrationFee : string;
    readonly repertoire : IPiece[]                  = [];
    readonly sectionalsSopranoAlto : Rehearsal[]    = [];
    readonly sectionalsTenorBass : Rehearsal[]      = [];
    readonly soloists : ISoloist[]                  = [];
    readonly syllabusRoutes : string[]              = [];
    readonly tuttiRehearsals : Rehearsal[]          = [];
    
    constructor(quarter : string,
                syllabusName : string,
                directors : string[],
                instructors : string[],
                collaborators : string[],
                soloists : ISoloist[],
                posterRoutes : ImageRoutes,
                heraldImageRoutes : ImageRoutes,
                description : string,
                preregisterDate : DateTime,
                registrationFee : string,
                membershipLimit : number) {
        this.quarter = quarter;

        if (syllabusName) {
            this.syllabusRoutes = ['.pdf', '.docx', '.doc'].map((ext) => composeExistingRoute('/assets/syllabi', syllabusName, ext))
                                                            .filter((route) => (route != null));
            if (0 == this.syllabusRoutes.length) {
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
        if (soloists) {
            this.soloists.push(...soloists);
        }

        this.posterRoutes = posterRoutes;
        this.heraldImageRoutes = heraldImageRoutes;
        this.description = (description || '');
        this.preregisterDate = preregisterDate;
        this.registrationFee = registrationFee;
        this.membershipLimit = membershipLimit;
    }

    get id() { return slugify(this.quarter).toLowerCase(); }
    get firstConcert() { return this.concerts[0]; }

    addConcert(start : DateTime, call : DateTime, location : string) {
        this.concerts.push({
            start: start,
            call: call,
            location: location
        });
        this.concerts.sort((a, b) => {
            return -b.start.diff(a.start).toMillis();
        });
    }

    addEvent(start : DateTime, location : string, title : string) {
        this.events.push({
            start: start,
            location: location,
            title: title
        });
        this.events.sort((a, b) => {
            return -b.start.diff(a.start).toMillis();
        });
    }

    addRepertoire(piece : IPiece, isMain : boolean = false) {
        this.repertoire.push(piece);
    }

    addTuttiRehearsals(rehearsals : Rehearsal[]) {
        this.tuttiRehearsals.push(...rehearsals);
        this.tuttiRehearsals.sort((a, b) => -b.start.diff(a.start).toMillis());
    }

    addTBSectionals(sectionals : Rehearsal[]) {
        this.sectionalsTenorBass.push(...sectionals);
        this.sectionalsTenorBass.sort((a, b) => -b.start.diff(a.start).toMillis());
    }

    addSASectionals(sectionals : Rehearsal[]) {
        this.sectionalsSopranoAlto.push(...sectionals);
        this.sectionalsSopranoAlto.sort((a, b) => -b.start.diff(a.start).toMillis());
    }

    addDressRehearsal(dress : DressRehearsal) {
        this.dressRehearsals.push(dress);
        this.dressRehearsals.sort((a, b) => -b.start.diff(a.start).toMillis());
    }

    static deserialize(data : PerformanceDataField, options) {
        return deserializePerformance(data, options);
    }
}

function deserializePerformance(data : PerformanceDataField, options) : Performance {
    const result = new Performance(data.quarter,
                                   data.syllabus,
                                   data.directors,
                                   data.instructors,
                                   data.collaborators,
                                   data.soloists,
                                   (data.poster ? new ImageRoutes('/assets/posters', data.poster.basename, data.poster.caption) : null),
                                   (data.heraldImage ? new ImageRoutes('/assets/heralds', data.heraldImage.basename, data.heraldImage.caption) : null),
                                   data.description,
                                   (data.preregister ? DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: options.timezone }) : null),
                                   data.registrationFee,
                                   data.membershipLimit);

    data.concerts.forEach((c) => {
        result.addConcert(createDateTime(c.date, c.start, options.timezone),
                          createDateTime(c.date, c.call, options.timezone),
                          c.location)
    });

    data.repertoire.main.forEach((p) => result.addRepertoire(deserializePiece(p), true));
    if (data.repertoire.other) {
        data.repertoire.other.forEach((p) => result.addRepertoire(deserializePiece(p)));
    }

    if (data.events) {
        data.events.forEach((e) => {
            result.addEvent(createDateTime(e.date, e.start, options.timezone),
                            e.location,
                            e.title);
        });
    }

    if (data.tuttiRehearsals) {
        data.tuttiRehearsals.forEach((s) => result.addTuttiRehearsals(createRehearsalSequence(s, options.timezone)));
    }

    if (data.tuttiRehearsalNotes) {
        data.tuttiRehearsalNotes.forEach((note) => parseTuttiRehearsalNote(note, result.tuttiRehearsals, options.timezone));
    }

    if (data.mensSectionals) {
        // TODO: change yml schema from mensSectionals to sectionalsTenorBass
        data.mensSectionals.forEach((s) => result.addTBSectionals(createRehearsalSequence(s, options.timezone)));
    }

    if (data.womensSectionals) {
        // TODO: change yml schema from womensSectionals to sectionalsSopranoAlto
        data.womensSectionals.forEach((s) => result.addSASectionals(createRehearsalSequence(s, options.timeszone)));
    }

    if (data.dressRehearsals) {
        data.dressRehearsals.forEach((dr) => result.addDressRehearsal({
            start: createDateTime(dr.date, dr.start, options.timezone),
            location: dr.location
        }));
    }

    // TODO: deserialize links

    return result;
}

function deserializePiece(data : PieceDataField) : IPiece {
    const piece = new Piece(data.title,
                            deserializeComposer(data.composer),
                            data.movement,
                            data.translation,
                            data.commonTitle,
                            data.catalog,
                            data.arranger,
                            data.prefix,
                            data.suffix);
    
    return (data.performanceNote ?
                new NotedPerformance(piece, data.performanceNote) :
                piece);
}

function deserializeComposer(composer: ComposerDataField) : IComposer {
    if (!composer) return null;

    // If the composer field is an array, the final element is the family name and
    // the space-joined concatenation of the fields is the full name.
    // If the composer field is a single string, the family name is the final word
    // in the string.
    return (Array.isArray(composer) ?
                new Composer(composer.join(' '), composer[composer.length - 1]) :
                new Composer(composer, composer.split(' ').slice(-1)[0]));
}
