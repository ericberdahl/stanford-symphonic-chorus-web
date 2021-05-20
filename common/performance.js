import fs from 'fs';
import path from 'path';
import process from 'process';
import util from 'util';

import { DateTime } from 'luxon';

import Piece from './piece'

function findFileVariants(baseRoute, variants)
{
    const publicDir = path.join(process.cwd(), 'public');

    let result = [];
    variants.forEach((variant) => {
        const route = baseRoute + '.' + variant.toLowerCase();
        const filePath = path.join(publicDir, route);
        try {
            fs.accessSync(filePath);
            result.push({
                route: route,
                variant: variant
            });
        }
        catch (e) {
            // noop - access failed
            // console.debug('no access for %s', filePath);
        }

    });

    return result;
}

export default class Performance {
    #scheduleRoute      = "";
    #quarter            = "";
    #syllabusRoutes     = [];
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

    get collaborators() { return this.#collaborators; }
    get concerts() { return this.#concerts; }
    get directors() { return this.#directors; }
    get instructors() { return this.#instructors; }
    get membershipLimit() { return this.#membershipLimit; }
    get preregisterDate() { return this.#preregisterDate; }
    get quarter() { return this.#quarter; }
    get repertoire() { return this.#repertoire; }
    get registrationFee() { return this.#registrationFee; }
    get scheduleRoute() { return this.#scheduleRoute; }
    get soloists() { return this.#soloists; }
    get syllabusRoutes() { return this.#syllabusRoutes; }

    get firstConcert() { return this.#concerts[0]; }

    static deserialize(data, route, options) {
        const result = new Performance();

        result.#scheduleRoute = route;

        result.#quarter = data.quarter;
        result.#registrationFee = data.registrationFee;
        result.#membershipLimit = data.membershipLimit;
        result.#soloists = (data.soloists ? data.soloists : result.#soloists);;
        result.#collaborators = (data.collaborators ? data.collaborators : result.#collaborators);
        result.#directors = (data.directors ? data.directors : result.#directors);
        result.#instructors = (data.instructors ? data.instructors : result.#instructors);

        if (data.preregister) {
            result.#preregisterDate = DateTime.fromFormat(data.preregister, 'yyyy-MM-dd', { setZone: options.timezone });
        }

        if (data.syllabus) {
            const baseRoute = '/assets/syllabi/' + data.syllabus;
            result.#syllabusRoutes = findFileVariants(baseRoute, ['PDF', 'DOCX', 'DOC']);
            if (0 == result.#syllabusRoutes.length) {
                throw new Error(util.format('No syllabi variants found for "%s"', data.syllabus));
            }
        }

        data.concerts.forEach((c) => {
            result.#concerts.push({
                start: DateTime.fromFormat(c.date + ' ' + c.start, 'yyyy-MM-dd HH:mm', { setZone: options.timezone }),
                call: DateTime.fromFormat(c.date + ' ' + c.call, 'yyyy-MM-dd HH:mm', { setZone: options.timezone }),
                location: c.location
            });
        });
        result.#concerts.sort((a, b) => {
            return -b.start.diff(a.start).toMillis();
        });

        data.repertoire.main.forEach((p) => {
            result.#repertoire.push(Piece.deserialize(p, options));
        });
        if (data.repertoire.other) {
            data.repertoire.other.forEach((p) => {
                result.#repertoire.push(Piece.deserialize(p, options));
            });
        }

        // TODO deserialize posters
        // TODO deserialize links
        // TODO deserialize images
        // TODO deserialize rehearsals
        // TODO deserialize sectionals
        // TODO deserialize dress rehearsals
        // TODO deserialize events
        // TODO deserialize description

        return result;
    }
}
