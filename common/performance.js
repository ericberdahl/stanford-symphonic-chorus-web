import Piece from './piece'

import { DateTime } from 'luxon';

import fs from 'fs';
import path from 'path';
import process from 'process';
import util from 'util';

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

class ImageRoutes {
    #pdf        = null;
    #jpg        = null;
    #caption    = null;

    constructor() {

    }

    get pdf() { return this.#pdf; }
    get jpg() { return this.#jpg; }
    get caption() { return this.#caption; }

    static deserialize(data, directoryRoute, options) {
        const result = new ImageRoutes();

        const baseRoute = directoryRoute + data.basename;
        
        const routes = findFileVariants(baseRoute, ['pdf', 'jpg']);
        if (0 == routes.length) {
            throw new Error(util.format('No image variants found for "%s"', data.basename));
        }

        const variantMap = {
            'pdf': '#pdf',
            'jpg': '#jpg',
        }

        routes.forEach((r) => {
            if ('pdf' == r.variant) {
                result.#pdf = r.route;
            }
            else if ('jpg == r.variant') {
                result.#jpg = r.route;
            }
            else {
                throw new Error(util.format('Unrecognized variant attempted "%s"', r.variant));
            }
        });

        result.#caption = data.caption;

        return result;
    }
}

export default class Performance {
    #collaborators      = [];
    #concerts           = [];
    #description        = [];
    #directors          = [];
    #dressRehearsals    = [];
    #events             = [];
    #heraldImageRoutes  = null;
    #instructors        = [];
    #links              = [];
    #mainPieces         = [];
    #membershipLimit    = 0;
    #posterRoutes       = null;
    #preregisterDate    = null;
    #quarter            = "";
    #rehearsals         = [];
    #registrationFee    = null;
    #repertoire         = [];
    #scheduleRoute      = "";
    #sectionals         = [];
    #soloists           = [];
    #syllabusRoutes     = [];
    
    constructor() {

    }

    get collaborators() { return this.#collaborators; }
    get concerts() { return this.#concerts; }
    get description() { return this.#description; }
    get directors() { return this.#directors; }
    get heraldImageRoutes() { return this.#heraldImageRoutes; }
    get instructors() { return this.#instructors; }
    get mainPieces() { return this.#mainPieces; }
    get membershipLimit() { return this.#membershipLimit; }
    get posterRoutes() { return this.#posterRoutes; }
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

        result.#collaborators = (data.collaborators ? data.collaborators : result.#collaborators);
        result.#description = (data.description ? data.description : result.#description);
        result.#directors = (data.directors ? data.directors : result.#directors);
        result.#instructors = (data.instructors ? data.instructors : result.#instructors);
        result.#membershipLimit = data.membershipLimit;
        result.#quarter = data.quarter;
        result.#registrationFee = data.registrationFee;
        result.#soloists = (data.soloists ? data.soloists : result.#soloists);;

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
            const piece = Piece.deserialize(p, options);
            result.#mainPieces.push(piece);
            result.#repertoire.push(piece);
        });
        if (data.repertoire.other) {
            data.repertoire.other.forEach((p) => {
                result.#repertoire.push(Piece.deserialize(p, options));
            });
        }

        if (data.poster) {
            result.#posterRoutes = ImageRoutes.deserialize(data.poster, '/assets/posters/', options);
        }

        if (data.heraldImage) {
            result.#heraldImageRoutes = ImageRoutes.deserialize(data.heraldImage, '/assets/heralds/', options);
                    // TODO deserialize images
        }

        // TODO deserialize links
        // TODO deserialize rehearsals
        // TODO deserialize sectionals
        // TODO deserialize dress rehearsals
        // TODO deserialize events

        return result;
    }
}
