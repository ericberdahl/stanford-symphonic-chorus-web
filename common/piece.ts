import { Composer, ComposerStaticProps, SerializedComposer } from "./composer";
import { FYLPRefStaticProps, FYLP } from "./fylp";
import { Performance } from "./performance";
import { PerformanceRefStaticProps, performanceRefStaticProps } from "./performanceStaticProps";
import { PieceSupplementStaticProps, PieceSupplement } from "./pieceSupplement";

import hash from 'object-hash';

import util from 'util';

// TODO : refactor Piece static props into Piece

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

export type PieceStaticProps = {
    arranger : string;
    catalog : string;
    commonTitle : string;
    composer : ComposerStaticProps;
    fylp : FYLPRefStaticProps;
    movement : string;
    performances : PerformanceRefStaticProps[];
    prefix : string;
    supplements : PieceSupplementStaticProps[];
    suffix : string;
    title : string | string[];
    translation : string;
};

// TODO : move static prop generation to Piece.getStaticProps()
export async function pieceStaticProps(piece : IPiece) : Promise<PieceStaticProps> {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       await piece.composer.getStaticProps(),
        fylp:           (await piece.fylp?.getRefStaticProps()) || null,
        movement:       piece.movement,
        performances:   piece.performances.map(performanceRefStaticProps),
        prefix:         piece.prefix,
        supplements:    await Promise.all(piece.supplements.map((s) => s.getStaticProps())),
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
    };
}

// TODO : Remove IPiece
export interface IPiece {
    readonly arranger? : string;
    readonly catalog? : string;
    readonly commonTitle? : string;
    readonly composer : Composer;
    readonly movement? : string;
    readonly prefix? : string;
    readonly suffix? : string;
    readonly supplements : PieceSupplement[];
    readonly title : string | string[];
    readonly translation? : string;
    readonly performances : Performance[];
    fylp : FYLP;

    addPerformance(performanace : Performance);
}

function hashPiece(p : IPiece) : string {
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

export class Piece implements IPiece {
    readonly title : string | string[]
    readonly composer : Composer;

    readonly movement : string;
    readonly commonTitle : string;
    readonly translation : string;
    readonly catalog : string;
    readonly arranger : string;
    readonly supplements : PieceSupplement[]    = [];

    readonly prefix : string;
    readonly suffix : string;

    readonly performances : Performance[]   = [];
    fylp : FYLP;
    
    // TODO : expose GrandRepertoire publicly
    // TODO : create CacheWeakly<K,V> class to implement object caching
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
