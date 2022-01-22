import { Composer } from "./composer";
import { FYLP } from "./fylp";
import { Model } from './model'
import { Performance, Rehearsal } from './performance'
import { IPiece, Piece, SerializedPiece } from './piece';
import { PieceSupplement } from "./pieceSupplement";
import { Repertoire } from './repertoire';

import { DateTime } from 'luxon';

import getConfig from 'next/config'

import util from 'util';

const { serverRuntimeConfig } = getConfig()

type SerializedPerformancePiece = SerializedPiece & {
    performanceNote? : string;
}

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
    events? : SerializedEvent[];
    tuttiRehearsals : SerializedRehearsalSequence[];
    tuttiRehearsalNotes? : SerializedRehearsalNote[];
    mensSectionals? : SerializedRehearsalSequence[];
    womensSectionals? : SerializedRehearsalSequence[];
    dressRehearsals? : SerializedDressRehearsal[];
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
}

function createDateTime(date : string, timeOfDay : string) : DateTime {
    return DateTime.fromFormat(date + ' ' + timeOfDay, 'yyyy-MM-dd HH:mm', { setZone: serverRuntimeConfig.timezone });
}

// TODO: Don't generate the Rehearsal objects. Instead, callback to add the rehearsal to the Performance
function deserializeRehearsalSequence(spec : SerializedRehearsalSequence) : Rehearsal[] {
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
    } while(finalStartDateTime.diff(nextStartDateTime).toMillis() >= 0);

    return result;
}

async function deserializePieceForPerformance(serializedPiece : SerializedPerformancePiece, performance : Performance, isMain : boolean, repertoire : Repertoire) {
    const piece = repertoire.addPiece(await Piece.deserialize(serializedPiece));

    performance.addRepertoire(serializedPiece.performanceNote ?
                                    new NotedPerformance(piece, serializedPiece.performanceNote) :
                                    piece,
                              isMain);
}

export function deserializePerformance(data : SerializedPerformance, model : Model) : Performance {
    const result = new Performance(data.quarter,
                                   data.syllabus,
                                   data.directors,
                                   data.instructors,
                                   data.collaborators,
                                   data.soloists,
                                   data.description,
                                   (data.preregister ? DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: serverRuntimeConfig.timezone }) : null),
                                   data.registrationFee,
                                   data.membershipLimit);

    data.concerts.forEach((c) => {
        result.addConcert(createDateTime(c.date, c.start),
                        createDateTime(c.date, c.call),
                        c.location)
    });

    if (data.repertoire.main) {
        data.repertoire.main.forEach((p) => deserializePieceForPerformance(p, result, true, model.repertoire));
    }
    if (data.repertoire.other) {
        data.repertoire.other.forEach((p) => deserializePieceForPerformance(p, result, false, model.repertoire));
    }

    if (data.poster) {
        result.setPoster(data.poster.basename, data.poster.caption);
    }
    if (data.heraldImage) {
        result.setHeraldImage(data.heraldImage.basename, data.heraldImage.caption);
    }

    if (data.events) {
        data.events.forEach((e) => {
            result.addEvent(createDateTime(e.date, e.start),
                            e.location,
                            e.title);
        });
    }

    if (data.tuttiRehearsals) {
        data.tuttiRehearsals.forEach((s) => result.addTuttiRehearsals(deserializeRehearsalSequence(s)));
    }

    if (data.tuttiRehearsalNotes) {
        data.tuttiRehearsalNotes.forEach((note) => {
            const noteDateTime : DateTime = createDateTime(note.date, '00:00');
            const rehearsal : Rehearsal = result.tuttiRehearsals.find((e) => (e.start.year == noteDateTime.year &&
                                                                              e.start.month == noteDateTime.month &&
                                                                              e.start.day == noteDateTime.day));
            if (!rehearsal) throw new Error(util.format('Cannot find tuttiRehearsal on date "%s" to attach a note', note.date));
            
            rehearsal.addNote(note.note);
        });
    }

    if (data.mensSectionals) {
        // TODO: change yml schema from mensSectionals to sectionalsTenorBass
        data.mensSectionals.forEach((s) => result.addTBSectionals(deserializeRehearsalSequence(s)));
    }

    if (data.womensSectionals) {
        // TODO: change yml schema from womensSectionals to sectionalsSopranoAlto
        data.womensSectionals.forEach((s) => result.addSASectionals(deserializeRehearsalSequence(s)));
    }

    if (data.dressRehearsals) {
        data.dressRehearsals.forEach((dr) => result.addDressRehearsal({
            start: createDateTime(dr.date, dr.start),
            location: dr.location
        }));
    }

    if (data.supplements) {
        result.supplements.push(...data.supplements);
    }

    model.addPerformance(result);

    return result;
}
