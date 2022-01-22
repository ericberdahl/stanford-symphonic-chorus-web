import { Composer, ComposerStaticProps, SerializedComposer } from "./composer";
import { FYLPRefStaticProps, FYLP } from "./fylp";
import { Performance, PerformanceRefStaticProps } from "./performance";
import { PieceSupplementStaticProps, PieceSupplement } from "./pieceSupplement";

import hash from 'object-hash';

import util from 'util';

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

export class Piece {
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

    addPerformance(performanace : Performance) {
        this.performances.push(performanace);
        this.performances.sort((a, b) => a.compare(b));
    }

    compare(other : Piece) : number {
        let result = 0;
    
        const makeString = (s) => (s || '');
        const makeStringArray = (s) => (Array.isArray(s) ? s : [ makeString(s) ]);
        
        if (0 == result) {
            result = this.composer.compare(other.composer);
        }
        if (0 == result) {
            const thisTitle = makeStringArray(this.title);
            const otherTitle = makeStringArray(other.title);
            const maxLength = Math.max(thisTitle.length, otherTitle.length);
            
            thisTitle.push(...Array(maxLength - thisTitle.length).fill(''));
            otherTitle.push(...Array(maxLength - otherTitle.length).fill(''));
    
            result = thisTitle.reduce((prevResult, currentValue, currentIndex) => {
                return (0 != prevResult ?
                            prevResult :
                            currentValue.localeCompare(otherTitle[currentIndex]));
            }, 0);
        }
        if (0 == result) {
            result = makeString(this.movement).localeCompare(makeString(other.movement));
        }
        if (0 == result) {
            result = makeString(this.arranger).localeCompare(makeString(other.arranger));
        }
        if (0 == result && this.hashValue != other.hashValue) {
            console.warn(util.format('Found piece "%s" with hash mismatch', this.title));
        }
    
        return result;
    }

    get hashValue() : string {
        const elements = {
            composer:   this.composer.hashValue,
            title:      this.title,
            movement:   this.movement,
            arranger:   this.arranger,
        }
    
        return hash(elements);
    }

    async getStaticProps() : Promise<PieceStaticProps> {
        return {
            arranger:       this.arranger,
            catalog:        this.catalog,
            commonTitle:    this.commonTitle,
            composer:       await this.composer.getStaticProps(),
            fylp:           (await this.fylp?.getRefStaticProps()) || null,
            movement:       this.movement,
            performances:   await Promise.all(this.performances.map(async (p) => p.getRefStaticProps())),
            prefix:         this.prefix,
            supplements:    await Promise.all(this.supplements.map((s) => s.getStaticProps())),
            suffix:         this.suffix,
            title:          this.title,
            translation:    this.translation,
        };
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
        const hashValue = result.hashValue;

        if (this.sGrandRepertoire.has(hashValue)) {
            result = this.sGrandRepertoire.get(hashValue).deref();
        }
        else {
            this.sGrandRepertoire.set(hashValue, new WeakRef<Piece>(result));
        }

        return result;                                        
    }
}
