import process from 'process';

import Performance from './performance'

async function createModel() {
    const model = new Model();

    const basePath = process.cwd();

    const route = "/performances/2020-winter";
    const data = {
        membershipLimit: 220,
        registrationFee: "$60",
        quarter: "Winter 2020",
        syllabus: "/syllabi/Winter 2020",
    };

    model.addPerformance(Performance.deserialize(route, data));

    return model;
}

export default class Model {
    #performances   = [];

    constructor() {
    }

    addPerformance(p) {
        this.#performances.push(p);
        // TODO sort the performances by date
    }

    get currentQuarter() {
        // TODO depend on current quarter data
        return this.#performances[0];
    }

    static #sSingleton = null;
    static get singleton() {
        if (!this.#sSingleton) {
            this.#sSingleton = createModel();
        }

        return this.#sSingleton;
    }
}
