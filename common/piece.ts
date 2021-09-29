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

export function comparePieces(a : IPiece, b : IPiece) : number {
    let result = 0;

    const makeString = (s) => (s || '');
    const makeStringArray = (s) => (Array.isArray(s) ? s : [ makeString(s) ]);
    
    if (0 == result) {
        result = a.composer.familyName.localeCompare(b.composer.familyName);
    }
    if (0 == result) {
        result = a.composer.fullName.localeCompare(b.composer.fullName);
    }
    if (0 == result) {
        const aTitle = makeStringArray(a.title);
        const bTitle = makeStringArray(b.title);
        const maxLength = Math.max(aTitle.length, bTitle.length);
        
        aTitle.push(...Array(maxLength - aTitle.length).fill(''));
        bTitle.push(...Array(maxLength - bTitle.length).fill(''));

        result = aTitle.reduce((prevResult, currentValue, currentIndex) => {
            return (0 != prevResult ? prevResult :
                currentValue.localeCompare(bTitle[currentIndex]));
        }, 0);
    }
    if (0 == result) {
        result = makeString(a.movement).localeCompare(makeString(b.movement));
    }
    if (0 == result) {
        result = makeString(a.arranger).localeCompare(makeString(b.arranger));
    }

    return result;
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
