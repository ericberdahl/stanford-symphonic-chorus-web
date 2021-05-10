import fs from 'fs/promises';
import path from 'path';
import process from 'process';

import yaml from 'yaml';

import Performance from './performance'

const CONFIG_FILENAME = path.join('data', 'main.yml');
export default class Model {
    #performances       = [];
    #currentPerformance = null;

    constructor() {
    }

    addPerformance(p) {
        this.#performances.push(p);
        // TODO sort the performances by date
    }

    get currentQuarter() {
        return this.#currentPerformance;
    }

    static #sSingleton = null;
    static get singleton() {
        if (!this.#sSingleton) {
            this.#sSingleton = this.createModel();
        }

        return this.#sSingleton;
    }

    static async createModel() {
        const basePath = process.cwd();

        const config = yaml.parse(await fs.readFile(path.join(basePath, CONFIG_FILENAME), 'utf8'));

        const performanceOptions = {
            timezone: config.timezone
        }

        const model = new Model();

        const dirEntries = await fs.readdir(path.join(basePath, 'data', 'performances'), { withFileTypes: true });
        const performancesEntries = dirEntries.filter((dirent) => { return dirent.isFile(); })
                                        .map((dirent) => { return dirent.name; });
        const performances = await Promise.all(performancesEntries.map(async (filename) => {
            const slug = path.parse(filename).name;
            const route = '/performances/' + slug;
            
            const filepath = path.join(basePath, 'data', 'performances', filename);
            const contents = await fs.readFile(filepath, 'utf8');
            const performance = Performance.deserialize(yaml.parse(contents), route, performanceOptions);

            model.addPerformance(performance);
            if (slug == config.currentQuarter) {
                model.#currentPerformance = performance;
            }

            return performance;
        }));
    
        return model;
    }    
}
