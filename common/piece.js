export default class Piece {
    #title              = '';   // can be a string or an array of strings
    
    #composer           = '';
    #composerFamilyName = '';

    #movement           = '';
    #translation        = '';
    #commonTitle        = '';
    #catalog            = '';
    #arranger           = '';

    #prefix             = '';
    #suffix             = '';
    
    constructor() {

    }

    get arranger() { return this.#arranger; }
    get catalog() { return this.#catalog; }
    get commonTitle() { return this.#commonTitle; }
    get composer() { return this.#composer; }
    get composerFamilyName() { return this.#composerFamilyName; }
    get movement() { return this.#movement; }
    get prefix() { return this.#prefix; }
    get suffix() { return this.#suffix; }
    get title() { return this.#title; }
    get translation() { return this.#translation; }

    static deserialize(data, options) {
        let result = new Piece();

        result.#title = data.title;

        if (data.composer) {
            result.#composer = data.composer;

            // If the composer field is an array, the final element is the family name and
            // the space-joined concatenation of the fields is the full name.
            // If the composer field is a single string, the family name is the final word
            // in the string.
            if (Array.isArray(result.#composer)) {
                result.#composerFamilyName = result.#composer[result.#composerFamilyName.length - 1];
                result.#composer = result.#composer.join(' ');
            }
            else {
                const nameSegments = result.#composer.split(' ');
                result.#composerFamilyName = nameSegments[nameSegments.length - 1];
            }
        }

        result.#arranger = (data.arranger ? data.arranger : result.#arranger);
        result.#catalog = (data.catalog ? data.catalog : result.#catalog);
        result.#commonTitle = (data.commonTitle ? data.commonTitle : result.#commonTitle);
        result.#movement = (data.movement ? data.movement : result.#movement);
        result.#prefix = (data.prefix ? data.prefix : result.#prefix);
        result.#suffix = (data.suffix ? data.suffix : result.#suffix);
        result.#translation = (data.translation ? data.translation : result.#translation);
        
        if (data.performanceNote) {
            result = new NotedPerformance(result, data.performanceNote);
        }

        return result;
    }
}

class NotedPerformance {
    #piece  = null;
    #note   = '';

    constructor(piece, note) {
        this.#piece = piece;
        this.#note = note;
    }

    get arranger() { return this.#piece.arranger; }
    get catalog() { return this.#piece.catalog; }
    get commonTitle() { return this.#piece.commonTitle; }
    get composer() { return this.#piece.composer; }
    get composerFamilyName() { return this.#piece.composerFamilyName; }
    get movement() { return this.#piece.movement; }
    get prefix() { return this.#piece.prefix; }
    get title() { return this.#piece.title; }
    get translation() { return this.#piece.translation; }

    get suffix() {
        const elements = [this.#piece.suffix, this.#note].filter((value) => value != '');

        return elements.join(' ');
    }
}