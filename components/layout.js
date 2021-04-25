import Head from 'next/head'

import Breadcrumbs from './breadcrumbs'
import ContainerSearch from './containerSearch'
import Footer from './footer'
import NavTopic from './navTopic'
import Seal from './seal'

import styles from '../styles/layout.module.scss'

// TODO style the header
// TODO style the content_container
// TODO style the content_main

function LogoHeader(props) {
    return (props.logoHeader ? props.logoHeader : (
        <div className={styles.logo}>
            <img
                src="/images/logo_header/SSCCollage.jpg"
                alt="Stanford Symphonic Chorus"
                useMap="#LogoMap"/>
            <map name="LogoMap">
                <area shape="rect" coords="0,0,107,63" href="/images/logo_header/P1060915.jpg" alt="Chorus in rehearsal"/>
                <area shape="rect" coords="108,0,190,63" href="/images/logo_header/Altos.jpg" alt="Altos in rehearsal"/>
                <area shape="rect" coords="191,0,297,63" href="/images/logo_header/SoprCenter.jpg" alt="Sopranos in rehearsal"/>
                <area shape="rect" coords="298,0,425,63" href="/images/logo_header/P1070103.jpg" alt="Rehearsal in MemChu"/>
                <area shape="rect" coords="426,0,532,63" href="/images/logo_header/SteveSano2002.jpg" alt="Steve in rehearsal"/>
                <area shape="rect" coords="533,0,667,63" href="/images/logo_header/BeethovenW10.jpg" alt="Performance in MemChu"/>
                <area shape="rect" coords="668,0,749,63" href="/images/logo_header/Tenors.jpg" alt="Tenors in rehearsal"/>
            </map>
        </div>
    ));
}

function Spotlight(props) {
    return (props.spotlight ? (<div className={styles.spotlight}>{props.spotlight}</div>) : (<></>));
}

function Introduction(props) {
    return (props.introduction ? (<div className={styles.introduction}>{props.introduction}</div>) : (<></>));
}

function Sidebar(props) {
    return (props.sidebar ? (<div className={styles.sidebar}>{props.sidebar}<Seal/></div>) : (<></>));
}

export default function Layout(props) {
    return (
        <div className={styles[props.variant]}>
            <div className={styles.container}>
                <Head>
                    <title>{props.title}</title>
                </Head>

                <div className={styles.container_header}>
                    <div className={styles.header}>
                        <LogoHeader {...props}/>
                        <div className={styles.searchBox}>
                            <ContainerSearch/>
                        </div>
                    </div>
                </div>
                <div className={styles.navTopic}>
                    <NavTopic/>
                </div>
                <div className={styles.title}>
                    <h1>
                        {props.title}
                    </h1>
                </div>

                <Spotlight {...props}/>
                <Introduction {...props}/>

                <div className={styles.breadcrumbs}>
                    <Breadcrumbs path={props.breadcrumbs}/>
                </div>

                <div className={styles.content_main}>
                    {props.children}
                </div>

                <Sidebar {...props}/>
                <div className={styles.footer}>
                    <Footer/>
                </div>
            </div>
        </div>
    );
}
