export interface IPiece {
    readonly arranger : string;
    readonly catalog;
    readonly commonTitle;
    readonly composer;
    readonly composerFamilyName;
    readonly movement;
    readonly prefix;
    readonly suffix;
    readonly title;
    readonly translation;
}

export interface IComposer {
    readonly name : string;
    readonly familyName : string;
}

export class Composer implements IComposer {
    readonly name;
    readonly familyName;

    constructor(name : string, familyName : string) {
        this.name = name;
        this.familyName = familyName;
    }
}

export class Piece implements IPiece {
    readonly title : string | string[]
    readonly _composer : IComposer;

    readonly movement : string;
    readonly commonTitle : string;
    readonly translation : string;
    readonly catalog : string;
    readonly arranger : string;

    readonly prefix : string;
    readonly suffix : string;
    
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
        this._composer = (composer || new Composer('', ''));

        this.movement = (movement || '');
        this.commonTitle = (commonTitle || '');
        this.translation = (translation || '');
        this.catalog = (catalog || '');
        this.arranger = (arranger || '');

        this.prefix = (prefix || '');
        this.suffix = (suffix || '');
    }

    get composer() { return this._composer.name; }
    get composerFamilyName() { return this._composer.familyName; }
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
    get composer() : string { return this.piece.composer; }
    get composerFamilyName() : string { return this.piece.composerFamilyName; }
    get movement() : string { return this.piece.movement; }
    get prefix() : string { return this.piece.prefix; }
    get title() : string { return this.piece.title; }
    get translation() : string { return this.piece.translation; }

    get suffix() : string {
        const elements = [this.piece.suffix, this.note].filter((value) => value != '');
        return elements.join(' ');
    }
}
