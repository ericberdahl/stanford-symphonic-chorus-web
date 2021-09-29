import { IPiece } from './piece'

import imageSize from 'image-size'
import { DateTime } from 'luxon';

import slugify from 'slugify'

import fs from 'fs';
import path from 'path';
import process from 'process';
import util from 'util';

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

    addNote(note : string) : void {
        this.notes.push(note);
    }
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

interface ISoloist {
    readonly name : string;
    readonly part : string;
}

export class Performance {
    readonly collaborators : string[]               = [];
    readonly concerts : Concert[]                   = [];
    readonly description : string;
    readonly directors : string[]                   = [];
    readonly dressRehearsals : DressRehearsal[]     = [];
    readonly events : GenericEvent[]                = [];
    readonly instructors : string[]                 = [];
    readonly mainPieces : IPiece[]                  = [];
    readonly membershipLimit : number;
    readonly preregisterDate : DateTime;
    readonly quarter : string                       = '';
    readonly registrationFee : string;
    readonly repertoire : IPiece[]                  = [];
    readonly sectionalsSopranoAlto : Rehearsal[]    = [];
    readonly sectionalsTenorBass : Rehearsal[]      = [];
    readonly soloists : ISoloist[]                  = [];
    readonly syllabusRoutes : string[]              = [];
    readonly tuttiRehearsals : Rehearsal[]          = [];

    private _posterRoutes : ImageRoutes;
    private _heraldImageRoutes : ImageRoutes;

    constructor(quarter : string,
                syllabusName : string,
                directors : string[],
                instructors : string[],
                collaborators : string[],
                soloists : ISoloist[],
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

        this.description = (description || '');
        this.preregisterDate = preregisterDate;
        this.registrationFee = registrationFee;
        this.membershipLimit = membershipLimit;
    }

    get id() { return slugify(this.quarter).toLowerCase(); }
    get firstConcert() { return (0 < this.concerts.length ? this.concerts[0] : null); }
    get posterRoutes() { return this._posterRoutes; }
    get heraldImageRoutes() { return this._heraldImageRoutes; }

    compare(other : Performance) {
        return this.firstConcert.start.diff(other.firstConcert.start).toMillis();
    }

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
        piece.addPerformance(this);
        if (isMain) {
            this.mainPieces.push(piece);
        }
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

    setPoster(name : string, caption : string) {
        this._posterRoutes = new ImageRoutes('/assets/posters', name, caption);
    }

    setHeraldImage(name : string, caption : string) {
        this._heraldImageRoutes = new ImageRoutes('/assets/heralds', name, caption);
    }
}
