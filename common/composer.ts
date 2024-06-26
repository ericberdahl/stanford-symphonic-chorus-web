import { WeakRegistry } from "./weakRegistry";

import hash from 'object-hash';

import { strict as assert } from 'assert';

export type SerializedComposer = string | Array<string>;

export type ComposerStaticProps = {
    fullName : string;
    familyName : string;
};

export class Composer {
    readonly fullName;
    readonly familyName;

    private constructor(fullName : string, familyName : string) {
        this.fullName = fullName;
        this.familyName = familyName;
    }

    get hashValue() : string {
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
    
        assert.ok(this.fullName != other.fullName || this.familyName == other.familyName, `Found composer "${this.fullName}" with two family names, "${this.familyName}" and "${other.familyName}"`);
        assert.ok(0 != result || this.hashValue == other.hashValue, `Found composer "${this.fullName}" with hash mismatch`);
        assert.ok(0 != result || this === other, `Found composer "${this.fullName}" which compares equal to another but is a different object`);

        return result;
    }
    
    async getStaticProps() : Promise<ComposerStaticProps> {
        return {
            fullName:   this.fullName,
            familyName: this.familyName
        };
    }

    private static sAllComposers : WeakRegistry<string, Composer>   = new WeakRegistry<string, Composer>();

    static async deserialize(composer: SerializedComposer) : Promise<Composer> {

        // If the composer field is an array, the final element is the family name and
        // the space-joined concatenation of the fields is the full name.
        // If the composer field is a single string, the family name is the final word
        // in the string.
    
        let result = (!composer ?
                            new Composer('', '') :
                            (Array.isArray(composer) ?
                                new Composer(composer.join(' '), composer[composer.length - 1]) :
                                (new Composer(composer, composer.split(' ').slice(-1)[0])) ));
                            
        return this.sAllComposers.lookup(result.hashValue, result);;
    }
}
