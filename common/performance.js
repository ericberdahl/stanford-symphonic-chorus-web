import fs from 'fs';
import path from 'path';
import process from 'process';
import util from 'util';

import { DateTime } from 'luxon';

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

    get membershipLimit() { return this.#membershipLimit; }
    get preregisterDate() { return this.#preregisterDate; }
    get quarter() { return this.#quarter; }
    get registrationFee() { return this.#registrationFee; }
    get scheduleRoute() { return this.#scheduleRoute; }
    get syllabusRoutes() { return this.#syllabusRoutes; }

    static deserialize(data, route, options) {
        const result = new Performance();

        result.#scheduleRoute = route;

        result.#quarter = data.quarter;
        result.#registrationFee = data.registrationFee;
        result.#membershipLimit = data.membershipLimit;

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

        // TODO deserialize repertoire and mainPieces
        // TODO deserialize soloists
        // TODO deserialize collaborators
        // TODO deserialize posters
        // TODO deserialize directors and instructors
        // TODO deserialize links
        // TODO deserialize images
        // TODO deserialize rehearsals
        // TODO deserialize sectionals
        // TODO deserialize dress rehearsals
        // TODO deserialize concerts
        // TODO deserialize events
        // TODO deserialize description

        return result;
    }
}
