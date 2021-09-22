import Piece from './piece'

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
    startDate : string;
    endDate? : string;
    startTime: string;
    endTime: string;
    location: string
};

class Rehearsal {
    readonly start : DateTime;
    readonly end : DateTime;
    readonly location : string;
    readonly notes : Array<string> = [];

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

function createRehearsalSequence(spec, timezone : string) : Array<Rehearsal> {
    const frequency : FrequencyEnum = (spec.frequency ? spec.frequency : 'once');

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

    var result : Array<Rehearsal> = [];
    do {
        result.push(new Rehearsal(nextStartDateTime, nextEndDateTime, spec.location));

        nextStartDateTime = nextStartDateTime.plus(dateShift);
        nextEndDateTime = nextEndDateTime.plus(dateShift);
    } while(finalStartDateTime.diff(nextStartDateTime).toMillis() >= 0);

    return result;
}

// TODO: Typescript-ify the remaining code in this file
// TODO: Move performance yaml data parsing into its own module. Don't democratize the yaml-deserialization code

function parseTuttiRehearsalNote(note, tuttiRehearsals, timezone) {
    const noteDateTime : DateTime = createDateTime(note.date, "00:00", timezone);
    const rehearsal = tuttiRehearsals.find((e) => (e.start.year == noteDateTime.year && e.start.month == noteDateTime.month && e.start.day == noteDateTime.day));
    if (!rehearsal) throw new Error(util.format('Cannot find tuttiRehearsal on date "%s" to attach a note', note.date));
    
    rehearsal.addNote(note.note);
}

function findFileVariants(baseRoute, variants)
{
    const publicDir = path.join(process.cwd(), 'public');

    let result = [];
    variants.forEach((variant) => {
        const route = baseRoute + '.' + variant.toLowerCase();
        const filePath = path.join(publicDir, route);
        try {
            fs.accessSync(filePath);
            result.push({
                route: route,
                variant: variant
            });
        }
        catch (e) {
            // noop - access failed
            // console.debug('no access for %s', filePath);
        }

    });

    return result;
}

class ImageRoutes {
    #pdf        = null;
    #jpg        = null;
    #caption    = null;
    #width      = 0;
    #height     = 0;

    constructor() {

    }

    get pdf() { return this.#pdf; }
    get jpg() { return this.#jpg; }
    get caption() { return this.#caption; }
    get width() { return this.#width; }
    get height() { return this.#height; }

    static deserialize(data, directoryRoute, options) {
        const result = new ImageRoutes();

        const baseRoute = directoryRoute + data.basename;
        
        const routes = findFileVariants(baseRoute, ['pdf', 'jpg']);
        if (0 == routes.length) {
            throw new Error(util.format('No image variants found for "%s"', data.basename));
        }

        const variantMap = {
            'pdf': '#pdf',
            'jpg': '#jpg',
        }

        routes.forEach((r) => {
            if ('pdf' == r.variant) {
                result.#pdf = r.route;
            }
            else if ('jpg == r.variant') {
                result.#jpg = r.route;
            }
            else {
                throw new Error(util.format('Unrecognized variant attempted "%s"', r.variant));
            }
        });

        if (result.jpg) {
            const imagePath = path.join(process.cwd(), 'public', result.jpg);
            ({ width: result.#width, height: result.#height } = imageSize(imagePath));
        }
    
        result.#caption = data.caption;

        return result;
    }
}

export default class Performance {
    #collaborators          = [];
    #concerts               = [];
    #description            = [];
    #directors              = [];
    #dressRehearsals        = [];
    #events                 = [];
    #heraldImageRoutes      = null;
    #instructors            = [];
    #links                  = [];
    #mainPieces             = [];
    #membershipLimit        = 0;
    #posterRoutes           = null;
    #preregisterDate        = null;
    #quarter                = "";
    #registrationFee        = null;
    #repertoire             = [];
    #scheduleRoute          = "";
    #sectionalsSopranoAlto  = [];
    #sectionalsTenorBass    = [];
    #soloists               = [];
    #syllabusRoutes         = [];
    #tuttiRehearsals        = [];
    
    constructor() {

    }

    get collaborators() { return this.#collaborators; }
    get concerts() { return this.#concerts; }
    get description() { return this.#description; }
    get directors() { return this.#directors; }
    get dressRehearsals() { return this.#dressRehearsals; }
    get events() { return this.#events; }
    get heraldImageRoutes() { return this.#heraldImageRoutes; }
    get instructors() { return this.#instructors; }
    get mainPieces() { return this.#mainPieces; }
    get membershipLimit() { return this.#membershipLimit; }
    get posterRoutes() { return this.#posterRoutes; }
    get preregisterDate() { return this.#preregisterDate; }
    get quarter() { return this.#quarter; }
    get repertoire() { return this.#repertoire; }
    get registrationFee() { return this.#registrationFee; }
    get scheduleRoute() { return this.#scheduleRoute; }
    get sectionalsSopranoAlto() { return this.#sectionalsSopranoAlto; }
    get sectionalsTenorBass() { return this.#sectionalsTenorBass; }
    get soloists() { return this.#soloists; }
    get syllabusRoutes() { return this.#syllabusRoutes; }
    get tuttiRehearsals() { return this.#tuttiRehearsals; }

    get id() { return slugify(this.quarter).toLowerCase(); }
    get firstConcert() { return this.#concerts[0]; }

    static deserialize(data, route, options) {
        const result = new Performance();

        result.#scheduleRoute = route;

        result.#collaborators = (data.collaborators ? data.collaborators : result.#collaborators);
        result.#description = (data.description ? data.description : result.#description);
        result.#directors = (data.directors ? data.directors : result.#directors);
        result.#instructors = (data.instructors ? data.instructors : result.#instructors);
        result.#membershipLimit = data.membershipLimit;
        result.#quarter = data.quarter;
        result.#registrationFee = data.registrationFee;
        result.#soloists = (data.soloists ? data.soloists : result.#soloists);;

        if (data.preregister) {
            result.#preregisterDate = DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: options.timezone });
        }

        if (data.syllabus) {
            const baseRoute = '/assets/syllabi/' + data.syllabus;
            result.#syllabusRoutes = findFileVariants(baseRoute, ['PDF', 'DOCX', 'DOC']);
            if (0 == result.#syllabusRoutes.length) {
                throw new Error(util.format('No syllabi variants found for "%s"', data.syllabus));
            }
        }

        data.concerts.forEach((c) => {
            result.#concerts.push({
                start: createDateTime(c.date, c.start, options.timezone),
                call: createDateTime(c.date, c.call, options.timezone),
                location: c.location
            });
        });
        result.#concerts.sort((a, b) => {
            return -b.start.diff(a.start).toMillis();
        });

        data.repertoire.main.forEach((p) => {
            const piece = Piece.deserialize(p, options);
            result.#mainPieces.push(piece);
            result.#repertoire.push(piece);
        });
        if (data.repertoire.other) {
            data.repertoire.other.forEach((p) => {
                result.#repertoire.push(Piece.deserialize(p, options));
            });
        }

        if (data.poster) {
            result.#posterRoutes = ImageRoutes.deserialize(data.poster, '/assets/posters/', options);
        }

        if (data.heraldImage) {
            result.#heraldImageRoutes = ImageRoutes.deserialize(data.heraldImage, '/assets/heralds/', options);
                    // TODO: deserialize images
        }

        if (data.events) {
            result.#events = data.events.map((e) => ({
                start: createDateTime(e.date, e.start, options.timezone),
                location: e.location,
                title: e.title
            }));
        }

        if (data.tuttiRehearsals) {
            result.#tuttiRehearsals = data.tuttiRehearsals.map(createRehearsalSequence).reduce((a, b) => {
                return a.concat(b);
            }, []);
            result.#tuttiRehearsals.sort((a, b) => -b.start.diff(a.start).toMillis());
        }

        if (data.tuttiRehearsalNotes) {
            data.tuttiRehearsalNotes.forEach((note) => parseTuttiRehearsalNote(note, result.#tuttiRehearsals, options.timezone));
        }

        if (data.mensSectionals) {
            // TODO: change yml schema from mensSectionals to sectionalsTenorBass
            result.#sectionalsTenorBass = data.mensSectionals.map(createRehearsalSequence).reduce((a, b) => {
                return a.concat(b);
            }, []);
            result.#sectionalsTenorBass.sort((a, b) => -b.start.diff(a.start).toMillis());
        }

        if (data.womensSectionals) {
            // TODO: change yml schema from womensSectionals to sectionalsSopranoAlto
            result.#sectionalsSopranoAlto = data.womensSectionals.map(createRehearsalSequence).reduce((a, b) => {
                return a.concat(b);
            }, []);
            result.#sectionalsSopranoAlto.sort((a, b) => -b.start.diff(a.start).toMillis());
        }

        if (data.dressRehearsals) {
            data.dressRehearsals.forEach((dr) => {
                result.#dressRehearsals.push({
                    start: createDateTime(dr.date, dr.start, options.timezone),
                    location: dr.location
                });
            });
            result.#dressRehearsals.sort((a, b) => {
                return -b.start.diff(a.start).toMillis();
            });
        }

        // TODO: deserialize links

        return result;
    }
}
