import Link from 'next/link';
import { useRouter } from 'next/router'


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
    new SiteEntry('memberInfo', '/memberinfo'),
    new SiteEntry('performanceList', '/performances'),
];

export function isCurrentPage(page) {
    const router = useRouter();

    const entry = siteMap.find((value) => (value.name == page));
    if (!entry) throw new Error('Cannot find page named "' + page + '"');

    return (router.pathname == entry.route);
}

export default function PageLink({ page, anchor, children }) {
    const entry = siteMap.find((value) => (value.name == page));
    if (!entry) throw new Error('Cannot find page named "' + page + '"');

    const internalLink = entry.internalRoute + (anchor && 0 < anchor.length ? '#' + anchor : '');
    const externalLink = entry.externalRoute + (anchor && 0 < anchor.length ? '#' + anchor : '');

    return (
        <Link href={internalLink} as={externalLink}>{children}</Link>
    );
}
