import { FileRoutes, fileRoutesStaticProps, FileRouteStaticProp, ImageRoutes, ImageRoutesStaticProps, imageRoutesStaticProps } from './fileRoutes';
import { Gallery, GalleryRefStaticProps } from './gallery'
import { IPiece, PieceStaticProps, pieceStaticProps } from './piece'
import { makeSlug } from './slug';

import { DateTime } from 'luxon';
import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote';

import util from 'util';

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
        return this.firstConcert.start.diff(other.firstConcert.start).toMillis();
    }

    addConcert(start : DateTime, call : DateTime, location : string) {
        this.concerts.push(new Concert(start, location, call));
        this.concerts.sort((a, b) => {
            return -b.start.diff(a.start).toMillis();
        });
    }

    addEvent(start : DateTime, location : string, title : string) {
        this.events.push(new GenericEvent(start, location, title));
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
}
