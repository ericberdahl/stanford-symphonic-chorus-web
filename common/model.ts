import { FYLP_DATA_DIR, GALLERY_DATA_DIR, PERFORMANCE_DATA_DIR, SUPPLEMENT_DATA_DIR } from './constants';
import { FYLP } from './fylp';
import { Gallery } from './gallery';
import { GrandRepertoire } from './grandRepertoire';
import { Performance } from './performance'
import { PieceSupplement } from './pieceSupplement';

import glob from 'glob-promise';
import yaml from 'yaml';

import getConfig from 'next/config'

import { strict as assert } from 'assert';

import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import util from 'util';

const { serverRuntimeConfig } = getConfig()

export class Model {
    readonly performances : Performance[]           = [];
    readonly grandRepertoire : GrandRepertoire      = new GrandRepertoire();
    private _currentQuarter : Performance           = null;
    readonly pieceSupplements : PieceSupplement[]   = [];
    readonly galleries : Gallery[]                  = [];

    private constructor() {
    }

    get currentQuarter() { return this._currentQuarter; }

    get performanceHistory() : Performance[] {
        const index = this.performances.findIndex((e) => (e.id == this._currentQuarter.id));
        return this.performances.slice(index);
    }

    get fylp() : GrandRepertoire {
        const result = new GrandRepertoire();
        this.grandRepertoire.pieces.filter((p) => p.fylp).forEach((p) => result.addPiece(p));
        return result;
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

    private static sSingleton : Promise<Model> = Model.create();
    static getModel() : Promise<Model> {
        return this.sSingleton;
    }

    private static async create() : Promise<Model> {
        const basePath = process.cwd();
    
        const model = new Model();
    
        const performanceDatafiles = await glob('*.yml', { cwd: path.join(basePath, PERFORMANCE_DATA_DIR), realpath: true });
        const performances = await Promise.all(performanceDatafiles.map(async (filepath) => {            
            return Performance.deserialize(yaml.parse(await fs.readFile(filepath, 'utf8')));
        }));
        performances.forEach((perf) => {
            perf.repertoire.full.forEach((piece) => {
                model.grandRepertoire.addPiece(piece.piece);
            });
        });
        model.performances.push(...performances);
        model.performances.sort((a, b) => b.compare(a));
        model._currentQuarter = model.performances.find((p) => p.quarter == serverRuntimeConfig.currentQuarterName);
        assert.ok(model._currentQuarter, `Cannot find quarter named "${serverRuntimeConfig.currentQuarterName}"`);

        const fylpDatafiles = await glob('**/*.yml', { cwd: path.join(basePath, FYLP_DATA_DIR), realpath: true });
        const fylps = await Promise.all(fylpDatafiles.map(async (filepath) => {
            return FYLP.deserialize(yaml.parse(await fs.readFile(filepath, 'utf8')));
        }));
    
        const supplementDatafiles = await glob('**/*.yml', { cwd: path.join(basePath, SUPPLEMENT_DATA_DIR), realpath: true });
        const supplements = await Promise.all(supplementDatafiles.map(async (filepath) => {
            return PieceSupplement.deserialize(yaml.parse(await fs.readFile(filepath, 'utf8')));
        }));
        model.pieceSupplements.push(...supplements);
        model.pieceSupplements.forEach((s) => {
            s.piece.supplements.push(s);
        });
    
        const galleryDatafiles = await glob('**/*.yml', { cwd: path.join(basePath, GALLERY_DATA_DIR), realpath: true });
        const galleries = await Promise.all(galleryDatafiles.map(async (filepath) => {
            return Gallery.deserialize(yaml.parse(await fs.readFile(filepath, 'utf8')));
        }));
        galleries.forEach((g) => { model.performances.find((p) => p.quarter == g.quarter).galleries.push(g); })
        model.galleries.push(...galleries);
    
        return model;
    }
}
