import { makeSlug } from '../common/slug';

import getConfig from 'next/config'
import Link from 'next/link';
import { useRouter } from 'next/router'

import util from 'util';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

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

class FYLPCollection extends Collection {
    constructor(name) {
        super(name);
    }

    findSiteEntryForId(id) {
        return new SiteEntry(util.format('/fylp/%s',  id));
    }

    getPageId(page) {
        return util.format('%s/%s', makeSlug(page.composer.fullName), makeSlug(page.title));
    }
}

const collections = [
    new PerformanceCollection('performances'),
    new TopLevelCollection('topLevel'),
    new FYLPCollection('fylp'),
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
