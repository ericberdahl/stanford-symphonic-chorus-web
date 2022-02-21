import Breadcrumbs from './breadcrumbs'
import ContainerSearch from './containerSearch'
import Footer from './footer'
import { Img } from './htmlToolkit'
import Lightbox from './lightbox'
import NavTopic from './navTopic'
import PageLink, { isCurrentPage } from './pageLink'
import Seal from './seal'

import Head from 'next/head'

import styles from '../styles/layout.module.scss'

// TODO: style the header
// TODO: style the content_container
// TODO: style the content_main

function HomePageLogo() {
    // TODO: fix href to home page in banner
    return (
        <div className={styles.logo}>
            <Img
                src="/images/logo_header/banner.gif"
                alt="Stanford University - Stanford Symphonic Chorus Department of Music"
                useMap="#HomePageLogoMap"/>
            <map name="HomePageLogoMap">
                <area shape="rect" coords="0,0,263,60" href="http://www.stanford.edu" alt="Stanford University"/>
                <PageLink page="home" passHref><area shape="rect" coords="275,4,700,57" alt="Stanford Symphonic Chorus Department of Music"/></PageLink>
            </map>
        </div>
    )
}

function CollageLogo() {
    // TODO: fix href to images in banner
    return (
        <div className={styles.logo}>
            <Img
                src="/images/logo_header/SSCCollage.jpg"
                alt="Stanford Symphonic Chorus"
                useMap="#CollageLogoMap"/>
            <map name="CollageLogoMap">
                <area shape="rect" coords="0,0,107,63" href="/images/logo_header/P1060915.jpg" alt="Chorus in rehearsal"/>
                <area shape="rect" coords="108,0,190,63" href="/images/logo_header/Altos.jpg" alt="Altos in rehearsal"/>
                <area shape="rect" coords="191,0,297,63" href="/images/logo_header/SoprCenter.jpg" alt="Sopranos in rehearsal"/>
                <area shape="rect" coords="298,0,425,63" href="/images/logo_header/P1070103.jpg" alt="Rehearsal in MemChu"/>
                <area shape="rect" coords="426,0,532,63" href="/images/logo_header/SteveSano2002.jpg" alt="Steve in rehearsal"/>
                <area shape="rect" coords="533,0,667,63" href="/images/logo_header/BeethovenW10.jpg" alt="Performance in MemChu"/>
                <area shape="rect" coords="668,0,749,63" href="/images/logo_header/Tenors.jpg" alt="Tenors in rehearsal"/>
            </map>
        </div>
    );
}

function Spotlight() {
    return (
        <div className={styles.spotlight}>
            <Lightbox
                image="/images/FullChorus27Feb2010.jpg"
                display="/images/ChorusBanner.jpg"
                width={800}
                height={518}
                caption="Performance of Beethoven Mass in C on 27 February 2010. Photo by R. A. Wilson."
                img_width={754}
                img_height={160}/>
        </div>
    );
}

function Introduction({ introduction }) {
    return (introduction ? (<div className={styles.introduction}>{introduction}</div>) : (<></>));
}

function Sidebar({ sidebar }) {
    return (sidebar ? (<div className={styles.sidebar}>{sidebar}<Seal/></div>) : (<></>));
}

export default function Layout({ breadcrumbs, children, introduction, sidebar, title }) {
    const isHome = isCurrentPage('home');

    return (
        <div className={isHome ? styles.homeContainer : styles.container}>
            <Head>
                <title>{title}</title>
            </Head>

            <div className={styles.container_header}>
                <div className={styles.header}>
                    {isHome ? <HomePageLogo/> : <CollageLogo/>}
                    <div className={styles.searchBox}>
                        <ContainerSearch/>
                    </div>
                </div>
            </div>
            <div className={styles.navTopic}>
                <NavTopic/>
            </div>
            <div className={styles.title}>
                <h1>{title}</h1>
            </div>

            {isHome && <Spotlight />}
            <Introduction introduction={introduction}/>

            <div className={styles.content_main}>
                {breadcrumbs && (
                    <Breadcrumbs path={breadcrumbs}/>
                )}
                {children}
            </div>

            <Sidebar sidebar={sidebar}/>
            <div className={styles.footer}>
                <Footer/>
            </div>
        </div>
    );
}
