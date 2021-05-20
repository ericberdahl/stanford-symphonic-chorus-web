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
        const result = new Piece();

        result.#title = data.title;

        if (data.composer) {
            result.#composer = data.composer;
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
        
        return result;
    }
}
