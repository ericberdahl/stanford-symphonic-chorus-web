import getConfig from 'next/config'
import Link from 'next/link';
import { useRouter } from 'next/router'

import util from 'util';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

// TODO: create/route fylp content pages
// fylp/mascagni-easter-hymn.html
// fylp/vaughan-williams-sea-symphony.html
// fylp/brahms-requiem.html
// fylp/john-rutter-blow-blow-good-ale.html
// fylp/vaughan-williams-fantasia-on-christmas-carols.html
// fylp/orff-carmina-burana.html
// fylp/vaughan-williams-hodie.html
// fylp/zeisl-requiem-ebraico.html
// fylp/mendelssohn-psalm114.html
// fylp/verdi-te-deum.html
// fylp/aquilanti-sanctus.html
// fylp/bruckner-mass-no3-fminor.html
// fylp/brahms-nanie-schicksalslied.html
// fylp/finzi-magnificat.html
// fylp/berlioz-requiem.html
// fylp/schumann-mass-in-cminor.html
// fylp/verdi-stabat-mater.html
// fylp/elgar-music-makers.html
// fylp/finzi-god-is-gone-up.html
// fylp/bernstein-chichester-psalms.html
// fylp/stravinsky-symphony-of-psalms.html
// fylp/bruckner-psalm150.html
// fylp/john-rutter-magnificat.html
// fylp/mendelssohn-lobgesang.html
// fylp/beethoven-mass-in-c.html

// TODO: create/route asset pages
// performances/S2010/requiem_text.html
// performances/S2002/parzen.html
// performances/W2002/cminormass.html
// performances/F2008/Chichester-text/index.html
// performances/F2008/Amherst-text/index.html
// performances/S1995/text.html

// TODO: create/route galleries
// performances/W2010/gallery/album/res/info.html
// performances/W2010/gallery/album/res/hello.html
// performances/W2010/gallery/album/gallery.html

class SiteEntry {
    route   = ''

    constructor(route) {
        this.route = route;
    }

    get internalRoute() {
        return this.route;
    }

    get externalRoute() {
        var internalRoute = this.internalRoute;

        if ('/' == internalRoute.slice(-1)) {
            internalRoute += 'index';
        }

        return internalRoute + '.html';
    }
}

class Collection {
    #name   = ''

    constructor(name) {
        this.#name = name;
    }

    get name() { return this.#name; }

    getSiteEntry(page) {
        const entry = this.findSiteEntryForId(this.getPageId(page));
        if (!entry) throw new Error(util.format('Cannot find page named "%s" in collection "%s"', page, this.name));
        return entry;
    }

    // interfaces subclasses must implement

    findSiteEntryForId(page) {
        throw new Error(util.format('Collection "%s" needs to implement findSiteEntryForId', this.name));
    }

    getPageId(page) {
        throw new Error(util.format('Collection "%s" needs to implement getPageId', this.name));
    }
}
class TopLevelCollection extends Collection {
    siteMap = {
        about:              new SiteEntry('/about'),
        home:               new SiteEntry('/'),
        contactUs:          new SiteEntry('/contact'),
        fylpList:           new SiteEntry('/fylp'),
        memberInfo:         new SiteEntry('/memberinfo'),
        noFragrance:        new SiteEntry('/nofragrance'),
        performanceList:    new SiteEntry('/performances'),
        repertoire:         new SiteEntry('/repertoire'),
    };
    
    constructor(name) {
        super(name);
    }

    findSiteEntryForId(id) {
        return this.siteMap[id];        
    }

    getPageId(page) {
        return page;
    }
}

class PerformanceCollection extends Collection {
    constructor(name) {
        super(name);
    }

    findSiteEntryForId(id) {
        return new SiteEntry(util.format('/performances/%s',  id));
    }

    getPageId(page) {
        return page.id;
    }
}

const collections = [
    new PerformanceCollection('performances'),
    new TopLevelCollection('topLevel'),
];

function getCollection(collection) {
    collection = (collection ? collection : 'topLevel');

    const result = collections.find((c) => (c.name == collection));
    if (!result) throw new Error(util.format('Cannot find collection named "%s"', collection));

    return result;
}

export function isCurrentPage(page, collection) {
    const router = useRouter();
    const entry = getCollection(collection).getSiteEntry(page);

    return (router.pathname == entry.route);
}

export function getIdForCollection(page, collection) {
    return getCollection(collection).getPageId(page);
}

export default function PageLink({ collection, page, anchor, children, passHref }) {
    const entry = getCollection(collection).getSiteEntry(page);

    const internalLink = entry.internalRoute + (anchor && 0 < anchor.length ? '#' + anchor : '');
    const externalLink = entry.externalRoute + (anchor && 0 < anchor.length ? '#' + anchor : '');

    return (
        <Link href={serverRuntimeConfig.isExport ? externalLink : internalLink} passHref={passHref}>{children}</Link>
    );
}
