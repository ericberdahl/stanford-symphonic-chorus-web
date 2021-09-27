import { Performance } from "./performance";

export interface IComposer {
    readonly fullName : string;
    readonly familyName : string;
}

export interface IPiece {
    readonly arranger? : string;
    readonly catalog? : string;
    readonly commonTitle? : string;
    readonly composer : IComposer;
    readonly movement? : string;
    readonly prefix? : string;
    readonly suffix? : string;
    readonly title : string | string[];
    readonly translation? : string;
    readonly performances : Performance[];

    addPerformance(performanace : Performance);
}

export class Composer implements IComposer {
    readonly fullName;
    readonly familyName;

    constructor(fullName : string, familyName : string) {
        this.fullName = fullName;
        this.familyName = familyName;
    }
}

export class Piece implements IPiece {
    readonly title : string | string[]
    readonly composer : IComposer;

    readonly movement : string;
    readonly commonTitle : string;
    readonly translation : string;
    readonly catalog : string;
    readonly arranger : string;

    readonly prefix : string;
    readonly suffix : string;

    readonly performances : Performance[]   = [];
    
    constructor(
            title : string | string[],
            composer : IComposer,
            movement : string,
            translation : string,
            commonTitle : string,
            catalog : string,
            arranger : string,
            prefix : string,
            suffix : string) {
        this.title = (title || '');
        this.composer = composer;

        this.movement = (movement || '');
        this.commonTitle = (commonTitle || '');
        this.translation = (translation || '');
        this.catalog = (catalog || '');
        this.arranger = (arranger || '');

        this.prefix = (prefix || '');
        this.suffix = (suffix || '');
    }

    addPerformance(performanace : Performance) {
        this.performances.push(performanace);
        this.performances.sort((a, b) => a.compare(b));
    }
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
    get composer() : IComposer { return this.piece.composer; }
    get movement() : string { return this.piece.movement; }
    get performances() : Performance[] { return this.piece.performances; }
    get prefix() : string { return this.piece.prefix; }
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
