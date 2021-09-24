import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import util from 'util';

import yaml from 'yaml';

import Performance from './performance'

const CONFIG_FILENAME = path.join('data', 'main.yml');
export default class Model {
    #performances       = [];
    #currentPerformance = null;

    constructor() {
    }

    get currentQuarter() { return this.#currentPerformance; }
    get performances() { return this.#performances; }

    addPerformance(p) {
        if (false) {
            const compare = (a, b) => {
                a = a.firstConcert;
                b = b.firstConcert;

                return b.start.diff(a.start).toMillis();
            }

            // Find the insertion point for this performance that will maintain
            // the array in order of first concert date (most recent first, least recent last)
            let low = 0;
            let high = this.#performances.length;
            while (low < high) {
                let mid = (low + high) >>> 1;
                if (compare(this.#performances[mid], p) < 0) {
                    low = mid + 1;
                }
                else {
                    high = mid
                }
            };

            // Insert the performance
            this.#performances.splice(low, 0, p);
        }
        else {
            this.#performances.push(p);
            this.#performances.sort((a, b) => {
                a = a.firstConcert;
                b = b.firstConcert;

                return b.start.diff(a.start).toMillis();
            });
        }
    }

    getPerformanceById(id) {
        const result = this.#performances.find((e) => (e.id == id));
        if (!result) throw Error(util.format('Cannot find performanace with id=%s', id));
        return result;
    }

    getPerformancesAfterId(id, count) {
        const index = this.#performances.findIndex((e) => (e.id == id));
        if (-1 == index) throw Error(util.format('Cannot find performanace with id=%s', id));

        if (0 == count) return [];
        
        const start = (count > 0 ? index - count : index + 1);
        const end = (count > 0 ? start + count : start - count);

        return this.#performances.slice(Math.max(start, 0), Math.min(end, this.#performances.length - 1));
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
            const filepath = path.join(basePath, 'data', 'performances', filename);
            const contents = await fs.readFile(filepath, 'utf8');
            const performance = Performance.deserialize(yaml.parse(contents), performanceOptions);

            model.addPerformance(performance);
            if (performance.quarter == config.currentQuarter) {
                model.#currentPerformance = performance;
            }

            return performance;
        }));
    
        return model;
    }    
}
