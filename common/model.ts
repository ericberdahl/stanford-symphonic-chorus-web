import { Gallery } from './gallery';
import { Performance } from './performance'
import { Repertoire } from './repertoire';
import { ISupplement } from './supplement';
import { deserializeFYLP } from './serializedFYLP';
import { deserializePerformance } from './serializedPerformance'
import { deserializeSupplement } from './serializedSupplement';

import glob from 'glob-promise';
import yaml from 'yaml';

import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import util from 'util';

const CONFIG_FILENAME       = path.join('data', 'main.yml');

const FYLP_DATA_DIR         = path.join('data', 'fylp')
const GALLERY_DATA_DIR      = path.join('data', 'galleries')
const PERFORMANCE_DATA_DIR  = path.join('data', 'performances')
const SUPPLEMENT_DATA_DIR   = path.join('data', 'supplements')

type Configuration = {
    timezone : string;          // name of timezone in which the ensemble rehearses and performs
    currentQuarter : string;    // name of the current quarter being prepared by the ensemble
}

export interface IModel {
    readonly performances : Performance[];
    readonly currentQuarter : Performance;
    readonly timezone : string;
    readonly repertoire : Repertoire;
    readonly fylp : Repertoire;
    readonly supplements : ISupplement[];

    addPerformance(p : Performance);
    getPerformanceById(id : string) : Performance;
    getPerformancesAfterId(id : string, count : number) : Performance[];
}

async function createModel() : Promise<IModel> {
    const basePath = process.cwd();

    const model = new Model(<Configuration>yaml.parse(await fs.readFile(path.join(basePath, CONFIG_FILENAME), 'utf8')));

    const performanceDatafiles = await glob('*.yml', { cwd: path.join(basePath, PERFORMANCE_DATA_DIR), realpath: true });
    const performances = await Promise.all(performanceDatafiles.map(async (filepath) => {            
        return deserializePerformance(yaml.parse(await fs.readFile(filepath, 'utf8')), model);
    }));

    const fylpDatafiles = await glob('**/*.yml', { cwd: path.join(basePath, FYLP_DATA_DIR), realpath: true });
    const fylps = await Promise.all(fylpDatafiles.map(async (filepath) => {
        return deserializeFYLP(yaml.parse(await fs.readFile(filepath, 'utf8')));
    }));
    fylps.forEach((f) => {
        f.piece = model.repertoire.findPiece(f.piece);
    });

    const supplementDatafiles = await glob('**/*.yml', { cwd: path.join(basePath, SUPPLEMENT_DATA_DIR), realpath: true });
    const supplements = await Promise.all(supplementDatafiles.map(async (filepath) => {
        return deserializeSupplement(yaml.parse(await fs.readFile(filepath, 'utf8')));
    }));
    model.supplements.push(...supplements);
    // TODO : hook supplements into their pieces, not into the model

    const galleryDatafiles = await glob('**/*.yml', { cwd: path.join(basePath, GALLERY_DATA_DIR), realpath: true });
    const galleries = await Promise.all(galleryDatafiles.map(async (filepath) => {
        return Gallery.deserialize(yaml.parse(await fs.readFile(filepath, 'utf8')));
    }));
    galleries.forEach((g) => { model.performances.find((p) => p.quarter == g.quarter).galleries.push(g); })
    model.galleries.push(...galleries);

    return model;
}    

export default class Model implements IModel {
    readonly performances : Performance[]   = [];
    readonly repertoire : Repertoire        = new Repertoire();
    private _currentQuarter : Performance   = null;
    private config : Configuration;
    readonly supplements : ISupplement[]    = [];
    readonly galleries : Gallery[]          = [];

    constructor(config : Configuration) {
        this.config = config;
    }

    get currentQuarter() { return this._currentQuarter; }
    get timezone() { return this.config.timezone; }

    get performanceHistory() : Performance[] {
        const index = this.performances.findIndex((e) => (e.id == this._currentQuarter.id));
        return this.performances.slice(index);
    }

    get fylp() : Repertoire {
        const result = new Repertoire();
        this.repertoire.pieces.filter((p) => p.fylp).forEach((p) => result.addPiece(p));
        return result;
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
