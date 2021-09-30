import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import util from 'util';

import yaml from 'yaml';

import { Performance } from './performance'
import { Repertoire } from './repertoire';
import { deserializePerformance } from './serializedPerformance'

const CONFIG_FILENAME       = path.join('data', 'main.yml');
const PERFORMANCE_DATA_DIR  = path.join('data', 'performances')

type Configuration = {
    timezone : string;          // name of timezone in which the ensemble rehearses and performs
    currentQuarter : string;    // name of the current quarter being prepared by the ensemble
}

export interface IModel {
    readonly performances : Performance[];
    readonly currentQuarter : Performance;
    readonly timezone : string;
    readonly repertoire : Repertoire;

    addPerformance(p : Performance);
    getPerformanceById(id : string) : Performance;
    getPerformancesAfterId(id : string, count : number) : Performance[];
}

async function createModel() : Promise<IModel> {
    const basePath = process.cwd();

    const model = new Model(<Configuration>yaml.parse(await fs.readFile(path.join(basePath, CONFIG_FILENAME), 'utf8')));

    const performanceDataDirFullPath = path.join(basePath, PERFORMANCE_DATA_DIR);
    const dirEntries = await fs.readdir(performanceDataDirFullPath, { withFileTypes: true });
    const performancesEntries = dirEntries.filter((dirent) => dirent.isFile())
                                    .map((dirent) => dirent.name);
    const performances = await Promise.all(performancesEntries.map(async (filename) => {            
        const filepath = path.join(performanceDataDirFullPath, filename);
        const contents = await fs.readFile(filepath, 'utf8');
        const performance = deserializePerformance(yaml.parse(contents), model);

        return performance;
    }));

    return model;
}    

export default class Model implements IModel {
    readonly performances : Performance[]   = [];
    readonly repertoire : Repertoire = new Repertoire();
    private _currentQuarter : Performance   = null;
    private config : Configuration;

    constructor(config : Configuration) {
        this.config = config;
    }

    get currentQuarter() { return this._currentQuarter; }
    get timezone() { return this.config.timezone; }

    get performanceHistory() : Performance[] {
        const index = this.performances.findIndex((e) => (e.id == this._currentQuarter.id));
        return this.performances.slice(index);
    }

    addPerformance(p : Performance) {
        this.performances.push(p);
        this.performances.sort((a, b) => b.compare(a));
    
        if (p.quarter == this.config.currentQuarter) {
            this._currentQuarter = p;
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
            this.sSingleton = createModel();
        }

        return this.sSingleton;
    }
}
