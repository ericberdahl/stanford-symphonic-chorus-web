import Link from 'next/link';
import { useRouter } from 'next/router'

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

// TODO: create/route schedule pages
// performances/W2019/schedule.html
// performances/W2010/schedule.html
// performances/W2017/schedule.html
// performances/W2016/schedule.html
// performances/W2011/schedule.html
// performances/W2018/schedule.html
// performances/W2020/schedule.html
// performances/F2019/schedule.html
// performances/S1999-1/schedule.html
// performances/F2010/schedule.html
// performances/F2017/schedule.html
// performances/S2018/schedule.html
// performances/S2011/schedule.html
// performances/S2016/schedule.html
// performances/F2016/schedule.html
// performances/F2011/schedule.html
// performances/F2018/schedule.html
// performances/F2020/schedule.html
// performances/S2017/schedule.html
// performances/S2010/schedule.html
// performances/S2019/schedule.html
// performances/S2021/schedule.html
// performances/S2003/schedule.html
// performances/W1999/schedule.html
// performances/S2004/schedule.html
// performances/W1997/schedule.html
// performances/F2002/schedule.html
// performances/F2005/schedule.html
// performances/W1996/schedule.html
// performances/S2005/schedule.html
// performances/W1998/schedule.html
// performances/S2002/schedule.html
// performances/F2004/schedule.html
// performances/F2003/schedule.html
// performances/F1999/schedule.html
// performances/F1997/schedule.html
// performances/W2002/schedule.html
// performances/W2005/schedule.html
// performances/S1998/schedule.html
// performances/S1996/schedule.html
// performances/F1996/schedule.html
// performances/F1998/schedule.html
// performances/S2008-1/schedule.html
// performances/W2004/schedule.html
// performances/W2003/schedule.html
// performances/W2014/schedule.html
// performances/W2013/schedule.html
// performances/W2012/schedule.html
// performances/W2015/schedule.html
// performances/S2015/schedule.html
// performances/S2012/schedule.html
// performances/F2014/schedule.html
// performances/S1999-2/schedule.html
// performances/F2013/schedule.html
// performances/S2013/schedule.html
// performances/S2014/schedule.html
// performances/F2012/schedule.html
// performances/F2015/schedule.html
// performances/F2006/schedule.html
// performances/F2001/schedule.html
// performances/F2008/schedule.html
// performances/S2007/schedule.html
// performances/S2000/schedule.html
// performances/S2009/schedule.html
// performances/F2009/schedule.html
// performances/F2000/schedule.html
// performances/F2007/schedule.html
// performances/S2001/schedule.html
// performances/S2006/schedule.html
// performances/W2006/schedule.html
// performances/W2001/schedule.html
// performances/S1995/schedule.html
// performances/W2008/schedule.html
// performances/2013-bing-opening/schedule.html
// performances/W2009/schedule.html
// performances/W2000/schedule.html
// performances/W2007/schedule.html
// performances/F1995/schedule.html
// performances/S2008-2/schedule.html

class SiteEntry {
    name    = ''
    route   = ''

    constructor(name, route) {
        this.name = name;
        this.route = route;
    }

    get internalRoute() {
        const terminalChar = this.route.slice(-1);
    
        return ('/' == terminalChar ? this.route + 'index' : this.route);
    }

    get externalRoute() {
        return this.internalRoute + '.html';
    }
}

const siteMap = [
    new SiteEntry('about', '/about'),
    new SiteEntry('home', '/'),
    new SiteEntry('contactUs', '/contact'),
    new SiteEntry('fylpList', '/fylp'),
    new SiteEntry('memberInfo', '/memberinfo'),
    new SiteEntry('noFragrance', '/nofragrance'),
    new SiteEntry('performanceList', '/performances'),
    new SiteEntry('repertoire', '/repertoire'),
];

export function isCurrentPage(page) {
    const router = useRouter();

    const entry = siteMap.find((value) => (value.name == page));
    if (!entry) throw new Error('Cannot find page named "' + page + '"');

    return (router.pathname == entry.route);
}

export default function PageLink({ page, anchor, children, passHref }) {
    const entry = siteMap.find((value) => (value.name == page));
    if (!entry) throw new Error('Cannot find page named "' + page + '"');

    const internalLink = entry.internalRoute + (anchor && 0 < anchor.length ? '#' + anchor : '');
    const externalLink = entry.externalRoute + (anchor && 0 < anchor.length ? '#' + anchor : '');

    return (
        <Link href={internalLink} as={externalLink} passHref={passHref}>{children}</Link>
    );
}
