import { IModel } from './model'
import { Performance, Rehearsal } from './performance'
import { IPiece, Piece, NotedPerformance, IComposer, Composer } from './piece'

import { DateTime } from 'luxon';

import util from 'util';

type SerializedSoloist = {
    name : string;
    part : string;
}

type SerializedPoster = {
    basename : string;
    caption? : string;
}

type SerializedBaseEvent = {
    date : string;      // 'YYYY-MM-DD' : date of the event
    start : string;     // 'HH:MM' : 24-hour formatted start time of the event
    location : string;  // nickname of the location of the event
}

type SerializedConcert = SerializedBaseEvent & {
    call : string;  // 'HH:MM' : 24-hour formatted call time for the concert
}

type SerializedComposer = string | Array<string>;

type SerializedPiece = {
    title : string;
    composer? : SerializedComposer;
    movement? : string;
    translation? : string;
    commonTitle? : string;
    catalog? : string;
    arranger? : string;
    prefix? : string;
    suffix? : string;
    performanceNote? : string;
}

enum RehearsalFrequency {
    weekly = 'weekly',
    once = 'once'
}

type SerializedRehearsalSequence = {
    frequency? : RehearsalFrequency;
    startDate : string; // 'YYYY-MM-DD' : date on which the first rehearsal will occur
    endDate? : string;  // 'YYYY-MM-DD' : if present, date on which the last rehearsal will occur. Required unless frequence is 'once'
    startTime: string;  // 'HH:MM' : 24-hour formatted time at which rehearsals start
    endTime: string;    // 'HH:MM' : 24-hour formatted time at which rehearsals end
    location: string    // nickname of the location at which rehearsals are held
}

type SerializedRehearsalNote = {
    date : string;  // 'YYYY-MM-DD' : date of the rehearsal for which the note applies
    note : string;
}

type SerializedEvent = SerializedBaseEvent & {
    title : string;
}

type SerializedDressRehearsal = SerializedBaseEvent;

type SerializedPerformance = {
    quarter : string;           // human-readable name of quarter
    syllabus : string;          // basename of syllabus asset
    directors? : string[];       // list of names of the directors
    instructors? : string[];     // list of names of the instructors
    collaborators? : string[];   // list of nicknames of collaborators
    soloists? : SerializedSoloist[];
    poster? : SerializedPoster;
    heraldImage? : SerializedPoster;
    description? : string;       // HTML to be displayed as a description of the performance being prepared, often on the home page
    preregister : string;       // 'YYYY-MM-DD' : date the preregistration mail is expected to be sent
    registrationFee? : string;   // '$dd' : amount of the registration fee
    membershipLimit? : number;
    concerts : SerializedConcert[];
    repertoire : {
        main : SerializedPiece[];
        other? : SerializedPiece[];
    };
    events? : SerializedEvent[];
    tuttiRehearsals : SerializedRehearsalSequence[];
    tuttiRehearsalNotes? : SerializedRehearsalNote[];
    mensSectionals? : SerializedRehearsalSequence[];
    womensSectionals? : SerializedRehearsalSequence[];
    dressRehearsals? : SerializedDressRehearsal[];
}

function createDateTime(date : string, timeOfDay : string, timezone : string) : DateTime {
    return DateTime.fromFormat(date + ' ' + timeOfDay, 'yyyy-MM-dd HH:mm', { setZone: timezone });
}

// TODO: Don't generate the Rehearsal objects. Instead, callback to add the rehearsal to the Performance
function deserializeRehearsalSequence(spec : SerializedRehearsalSequence, timezone : string) : Rehearsal[] {
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

export function deserializePerformance(data : SerializedPerformance, model : IModel) : Performance {
    const result = new Performance(data.quarter,
                                   data.syllabus,
                                   data.directors,
                                   data.instructors,
                                   data.collaborators,
                                   data.soloists,
                                   data.description,
                                   (data.preregister ? DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: model.timezone }) : null),
                                   data.registrationFee,
                                   data.membershipLimit);

    data.concerts.forEach((c) => {
        result.addConcert(createDateTime(c.date, c.start, model.timezone),
                        createDateTime(c.date, c.call, model.timezone),
                        c.location)
    });

    if (data.repertoire.main) {
        data.repertoire.main.forEach((p) => result.addRepertoire(deserializePiece(p, model), true));
    }
    if (data.repertoire.other) {
        data.repertoire.other.forEach((p) => result.addRepertoire(deserializePiece(p, model)));
    }

    if (data.poster) {
        result.setPoster(data.poster.basename, data.poster.caption);
    }
    if (data.heraldImage) {
        result.setHeraldImage(data.heraldImage.basename, data.heraldImage.caption);
    }

    if (data.events) {
        data.events.forEach((e) => {
            result.addEvent(createDateTime(e.date, e.start, model.timezone),
                            e.location,
                            e.title);
        });
    }

    if (data.tuttiRehearsals) {
        data.tuttiRehearsals.forEach((s) => result.addTuttiRehearsals(deserializeRehearsalSequence(s, model.timezone)));
    }

    if (data.tuttiRehearsalNotes) {
        data.tuttiRehearsalNotes.forEach((note) => {
            const noteDateTime : DateTime = createDateTime(note.date, '00:00', model.timezone);
            const rehearsal : Rehearsal = result.tuttiRehearsals.find((e) => (e.start.year == noteDateTime.year &&
                                                                              e.start.month == noteDateTime.month &&
                                                                              e.start.day == noteDateTime.day));
            if (!rehearsal) throw new Error(util.format('Cannot find tuttiRehearsal on date "%s" to attach a note', note.date));
            
            rehearsal.addNote(note.note);
        });
    }

    if (data.mensSectionals) {
        // TODO: change yml schema from mensSectionals to sectionalsTenorBass
        data.mensSectionals.forEach((s) => result.addTBSectionals(deserializeRehearsalSequence(s, model.timezone)));
    }

    if (data.womensSectionals) {
        // TODO: change yml schema from womensSectionals to sectionalsSopranoAlto
        data.womensSectionals.forEach((s) => result.addSASectionals(deserializeRehearsalSequence(s, model.timezone)));
    }

    if (data.dressRehearsals) {
        data.dressRehearsals.forEach((dr) => result.addDressRehearsal({
            start: createDateTime(dr.date, dr.start, model.timezone),
            location: dr.location
        }));
    }

    // TODO: deserialize links

    model.addPerformance(result);

    return result;
}

function deserializePiece(data : SerializedPiece, model : IModel) : IPiece {
    const composer = deserializeComposer(data.composer, model);

    const piece = model.repertoire.addPiece(new Piece(data.title,
                                                      composer,
                                                      data.movement,
                                                      data.translation,
                                                      data.commonTitle,
                                                      data.catalog,
                                                      data.arranger,
                                                      data.prefix,
                                                      data.suffix));
    
    return (data.performanceNote ?
                new NotedPerformance(piece, data.performanceNote) :
                piece);
}

function deserializeComposer(composer: SerializedComposer, model : IModel) : IComposer {

    // If the composer field is an array, the final element is the family name and
    // the space-joined concatenation of the fields is the full name.
    // If the composer field is a single string, the family name is the final word
    // in the string.

    const result = (!composer ? new Composer('', '') :
                   (Array.isArray(composer) ? new Composer(composer.join(' '), composer[composer.length - 1]) :
                   (new Composer(composer, composer.split(' ').slice(-1)[0])) ));

    return model.repertoire.validateComposer(result);
}
