import { IFYLP } from "./fylp";
import { Performance } from "./performance";
import { IPieceSupplement } from "./pieceSupplement";

import hash from 'object-hash';

import util from 'util';

// TODO : refactor Piece static props into Piece

type SerializedComposer = string | Array<string>;

export type SerializedPiece = {
    title : string;
    composer? : SerializedComposer;
    movement? : string;
    translation? : string;
    commonTitle? : string;
    catalog? : string;
    arranger? : string;
    prefix? : string;
    suffix? : string;
}

export interface IPiece {
    readonly arranger? : string;
    readonly catalog? : string;
    readonly commonTitle? : string;
    readonly composer : Composer;
    readonly movement? : string;
    readonly prefix? : string;
    readonly suffix? : string;
    readonly supplements : IPieceSupplement[];
    readonly title : string | string[];
    readonly translation? : string;
    readonly performances : Performance[];
    fylp : IFYLP;

    addPerformance(performanace : Performance);
}

function hashPiece(p : IPiece) {
    const elements = {
        composer:   p.composer.hashValue,
        title:      p.title,
        movement:   p.movement,
        arranger:   p.arranger,
    }

    return hash(elements);
}


export function comparePieces(a : IPiece, b : IPiece) : number {
    let result = 0;

    const makeString = (s) => (s || '');
    const makeStringArray = (s) => (Array.isArray(s) ? s : [ makeString(s) ]);
    
    if (0 == result) {
        result = a.composer.compare(b.composer);
    }
    if (0 == result) {
        const aTitle = makeStringArray(a.title);
        const bTitle = makeStringArray(b.title);
        const maxLength = Math.max(aTitle.length, bTitle.length);
        
        aTitle.push(...Array(maxLength - aTitle.length).fill(''));
        bTitle.push(...Array(maxLength - bTitle.length).fill(''));

        result = aTitle.reduce((prevResult, currentValue, currentIndex) => {
            return (0 != prevResult ?
                        prevResult :
                        currentValue.localeCompare(bTitle[currentIndex]));
        }, 0);
    }
    if (0 == result) {
        result = makeString(a.movement).localeCompare(makeString(b.movement));
    }
    if (0 == result) {
        result = makeString(a.arranger).localeCompare(makeString(b.arranger));
    }
    if (0 == result && hashPiece(a) != hashPiece(b)) {
        console.warn(util.format('Found piece "%s" with hash mismatch', a.title));
    }

    return result;
}

export class Composer {
    readonly fullName;
    readonly familyName;

    constructor(fullName : string, familyName : string) {
        this.fullName = fullName;
        this.familyName = familyName;
    }

    get hashValue() {
        const elements = {
            familyName: this.familyName,
            fullName:   this.fullName,
        }
    
        return hash(elements);
    }

    compare(other : Composer) : number {
        let result = 0;
    
        if (0 == result) {
            result = this.familyName.localeCompare(other.familyName);
        }
        if (0 == result) {
            result = this.fullName.localeCompare(other.fullName);
        }
    
        if (this.fullName == other.fullName && this.familyName != other.familyName) {
            console.warn(util.format('Found composer "%s" with two family names, "%s" and "%s"', this.fullName, this.familyName, other.familyName));
        }
        if (0 == result && this.hashValue != other.hashValue) {
            console.warn(util.format('Found composer "%s" with hash mismatch', this.fullName));
        }
    
        return result;
    }
    
    static async deserialize(composer: SerializedComposer) : Promise<Composer> {

        // If the composer field is an array, the final element is the family name and
        // the space-joined concatenation of the fields is the full name.
        // If the composer field is a single string, the family name is the final word
        // in the string.
    
        const result = (!composer ?
                            new Composer('', '') :
                            (Array.isArray(composer) ?
                                new Composer(composer.join(' '), composer[composer.length - 1]) :
                                (new Composer(composer, composer.split(' ').slice(-1)[0])) ));
    
        return result;
    }
    
}

export class Piece implements IPiece {
    readonly title : string | string[]
    readonly composer : Composer;

    readonly movement : string;
    readonly commonTitle : string;
    readonly translation : string;
    readonly catalog : string;
    readonly arranger : string;
    readonly supplements : IPieceSupplement[]    = [];

    readonly prefix : string;
    readonly suffix : string;

    readonly performances : Performance[]   = [];
    fylp : IFYLP;
    
    private static sGrandRepertoire : Map<string, WeakRef<Piece>>   = new Map<string, WeakRef<Piece>>();

    private constructor(
            title : string | string[],
            composer : Composer,
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

    compare(other : IPiece) : number {
        return comparePieces(this, other);
    }

    addPerformance(performanace : Performance) {
        this.performances.push(performanace);
        this.performances.sort((a, b) => a.compare(b));
    }

    static async deserialize(data : SerializedPiece) : Promise<Piece> {
        let result : Piece = new Piece(data.title,
                                        await Composer.deserialize(data.composer),
                                        data.movement,
                                        data.translation,
                                        data.commonTitle,
                                        data.catalog,
                                        data.arranger,
                                        data.prefix,
                                        data.suffix);
        const hashValue = hashPiece(result);

        if (this.sGrandRepertoire.has(hashValue)) {
            result = this.sGrandRepertoire.get(hashValue).deref();
        }
        else {
            this.sGrandRepertoire.set(hashValue, new WeakRef<Piece>(result));
        }

        return result;                                        
    }
}
