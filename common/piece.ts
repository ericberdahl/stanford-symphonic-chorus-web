interface IPiece {
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

type ComposerDataField = string | Array<string>;

interface IComposer {
    readonly name : string;
    readonly familyName : string;
}

class Composer implements IComposer {
    readonly name;
    readonly familyName;

    constructor(name : string, familyName : string) {
        this.name = name;
        this.familyName = familyName;
    }
}

function parseComposerDataField(composer: ComposerDataField) : IComposer {
    // If the composer field is an array, the final element is the family name and
    // the space-joined concatenation of the fields is the full name.
    // If the composer field is a single string, the family name is the final word
    // in the string.
    return (Array.isArray(composer) ?
                new Composer(composer.join(' '), composer[composer.length - 1]) :
                new Composer(composer, composer.split(' ').slice(-1)[0]));
}

export default class Piece implements IPiece {
    readonly title : string | Array<string>
    readonly _composer : IComposer;

    readonly movement : string;
    readonly commonTitle : string;
    readonly translation : string;
    readonly catalog : string;
    readonly arranger : string;

    readonly prefix : string;
    readonly suffix : string;
    
    constructor(
            title : string | Array<string>,
            composer : ComposerDataField,
            movement : string,
            translation : string,
            commonTitle : string,
            catalog : string,
            arranger : string,
            prefix : string,
            suffix : string) {
        this.title = (title || '');
        this._composer = (composer ? parseComposerDataField(composer) : new Composer('', ''));

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

    static deserialize(data, options) : IPiece {
        const piece = new Piece(data.title,
                                data.composer,
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
}

class NotedPerformance implements IPiece {
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