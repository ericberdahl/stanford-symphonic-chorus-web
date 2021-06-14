import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import PageLink from '../components/pageLink'
import Person from '../components/person'
import TitledSegment from '../components/titledSegment'

import Head from 'next/head'

import styles from '../styles/Home.module.scss'

function Introduction() {
    return (
        <div className={styles.events}>
            <TitledSegment title="Events">
                <Lightbox image="/images/home/MemChu.jpg"
                    width={1314}
                    height={852}
                    caption="Memorial Church, 22 February 2010. Photo by R. A. Wilson."
                    img_width={149}/>
                TODO finish home page introduction bar
            </TitledSegment>
        </div>
    );
}

function Sidebar() {
    return (
        <div className={styles.sidebar}>
            <TitledSegment title="Symphonic Chorus">
                <Lightbox image="/images/home/steve_altos.jpg"
                    width={800}
                    height={533}
                    caption="Alto section in rehearsal, 25 February 2010. Photo by R. A. Wilson."
                    img_width={149}/>
                <ul>
                    <li><PageLink page="performanceList"><a>SSC Performances</a></PageLink></li>
                    <li><PageLink page="fylpList"><a>For your listening pleasure</a></PageLink></li>
                    <li><PageLink page="memberInfo" anchor="auditions"><a>Joining the Chorus</a></PageLink></li>
                    <li>TODO link to current rehearsal schedule</li>
                </ul>
            </TitledSegment>
            <TitledSegment title="Stanford Arts">
                <Lightbox image="/images/home/rehearsal_front.jpg"
                    width={800}
                    height={533}
                    caption="Rehearsal, 25 February 2010. Photo by R. A. Wilson."
                    img_width={149}/>
                <ul>
                    <li><a href="//music.stanford.edu/Home/index.html">Music Department</a></li>
                    <li><a href="//music.stanford.edu/Ensembles/index.html">Stanford Ensembles</a></li>
                    <li><a href="//live.stanford.edu/">Stanford Live</a></li>
                    <li><a href="//arts.stanford.edu/">Stanford Arts</a></li>
                    <li><a href="//www.stanford.edu/group/tickets/index.html">Stanford Ticket Office</a></li>
                </ul>
            </TitledSegment>
        </div>
    );
}

export default function Home() {
    return (
        <Layout
            title="Stanford Symphonic Chorus"
            introduction={<Introduction/>}
            sidebar={<Sidebar/>}>
            <div className={styles.main}>
                <TitledSegment title="Welcome">
                    <div>
                        <div className={styles.hangingIndent}>
                            <Lightbox image="/images/home/SmallW10.jpg"
                                width={700}
                                height={448}
                                caption="Performance of Beethoven's Mass in C, 27 February 2010. Photo by R. A. Wilson."
                                img_width={130}/>
                        </div>
                        <p>
                            The Stanford Symphonic Chorus is a group of approximately 180 students, faculty, staff, and members of the community led by Director of Music and Conductor Stephen Sano.
                            The Chorus generally performs three works a year, one each academic quarter.
                            Each performance typically features a large choral work, and includes other choral or instrumental pieces.
                            See our <PageLink page="performanceList"><a>Performances</a></PageLink> page for information about past performances.
                        </p>
                    </div>
                    <div>
                        <p>
                            Due to the current situation with the COVID-19 pandemic, the Stanford Symphonic Chorus remains on hiatus through at least the Spring quarter of 2021.
                            The return of the Symphonic Chorus to regular activity will depend on (i) the progression of the virus, (ii) progress
                            and availability of an effective vaccine, and (iii) when non-Stanford students/faculty/staff are allowed to physically return to the core academic area of campus.
                            We anxiously look forward to the time that we can return to singing together again and celebrate the choral art!
                            For additional information, please contact the Director, <Person role="director" subject="Symphonc Chorus Inquiry"/>.
                        </p>
                    </div>
                    <div className={styles.hideForCovid19}>
                        TODO all the real home page content
                    </div>
                </TitledSegment>
            </div>
        </Layout>
    );
}
