export default class Performance {
    #scheduleRoute      = "";
    #quarter            = "";
    #syllabusRoute      = "";
    #repertoire         = [];
    #mainPieces         = [];
    #soloists           = [];
    #collaborators      = [];
    #poster             = null;
    #directors          = [];
    #instructors        = [];
    #links              = [];
    #registrationFee    = null;
    #membershipLimit    = 0;
    #preregisterDate    = null;
    #images             = [];
    #rehearsals         = [];
    #sectionals         = [];
    #dressRehearsals    = [];
    #concerts           = [];
    #events             = [];
    #description        = [];
    
    constructor() {

    }

    get scheduleRoute() { return this.#scheduleRoute; }
    get quarter() { return this.#quarter; }
    get syllabusRoute() { return this.#syllabusRoute; }
    get registrationFee() { return this.#registrationFee; }
    get membershipLimit() { return this.#membershipLimit; }

    static deserialize(route, data) {
        const result = new Performance();

        result.#scheduleRoute = route;

        result.#quarter = data.quarter;
        result.#syllabusRoute = data.syllabus;
        result.#registrationFee = data.registrationFee;
        result.#membershipLimit = data.membershipLimit;

        return result;
    }
}
