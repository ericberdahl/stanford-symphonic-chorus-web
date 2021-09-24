import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import util from 'util';

import yaml from 'yaml';

import Performance from './performance'

const CONFIG_FILENAME = path.join('data', 'main.yml');

type Configuration = {
    timezone : string;          // name of timezone in which the ensemble rehearses and performs
    currentQuarter : string;    // name of the current quarter being prepared by the ensemble
}

interface IModel {
    readonly performances : Performance[];
    readonly currentQuarter : Performance;
    readonly config : Configuration;
}

export default class Model implements IModel {
    readonly performances : Performance[]       = [];
    private currentPerformance : Performance    = null;
    readonly config : Configuration;

    constructor(config : Configuration) {
        this.config = config;
    }

    get currentQuarter() { return this.currentPerformance; }

    addPerformance(p : Performance) {
        this.performances.push(p);
        this.performances.sort((a, b) => b.firstConcert.start.diff(a.firstConcert.start).toMillis());
    
        if (p.quarter == this.config.currentQuarter) {
            this.currentPerformance = p;
        }
}

    getPerformanceById(id : string) : Performance {
        const result = this.performances.find((e) => (e.id == id));
        if (!result) throw Error(util.format('Cannot find performanace with id=%s', id));
        return result;
    }

    getPerformancesAfterId(id : string, count : number) : Performance[] {
        const index = this.performances.findIndex((e) => (e.id == id));
        if (-1 == index) throw Error(util.format('Cannot find performanace with id=%s', id));

        if (0 == count) return [];
        
        const start = (count > 0 ? index - count : index + 1);
        const end = (count > 0 ? start + count : start - count);

        return this.performances.slice(Math.max(start, 0), Math.min(end, this.performances.length - 1));
    }

    private static sSingleton  : Promise<IModel>;
    static get singleton() : Promise<IModel> {
        if (!this.sSingleton) {
            this.sSingleton = this.createModel();
        }

        return this.sSingleton;
    }

    static async createModel() : Promise<IModel> {
        const basePath = process.cwd();

        const model = new Model(<Configuration>yaml.parse(await fs.readFile(path.join(basePath, CONFIG_FILENAME), 'utf8')));

        const performanceOptions = {
            timezone: model.config.timezone
        }

        const dirEntries = await fs.readdir(path.join(basePath, 'data', 'performances'), { withFileTypes: true });
        const performancesEntries = dirEntries.filter((dirent) => dirent.isFile())
                                        .map((dirent) => dirent.name);
        const performances = await Promise.all(performancesEntries.map(async (filename) => {            
            const filepath = path.join(basePath, 'data', 'performances', filename);
            const contents = await fs.readFile(filepath, 'utf8');
            const performance = Performance.deserialize(yaml.parse(contents), performanceOptions);

            model.addPerformance(performance);

            return performance;
        }));
    
        return model;
    }    
}
