import Collaborator from '../components/collaborator'
import CommaSeparatedList from '../components/commaSeparatedList'
import Covid19MitigationPolicy from '../components/covid19MitigationPolicy'
import { compareISODate, DayOfMonth, Month, TimeOfDay, Year } from '../components/dateTime'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import Location from '../components/location'
import Markdown from '../components/markdown'
import PageLink from '../components/pageLink'
import PairedImage from '../components/pairedImage'
import PieceCitation from '../components/pieceCitation'
import SpaceSeparatedPhrase from '../components/spaceSeparatedPhrase'
import TitledSegment from '../components/titledSegment'

import { Model } from '../common/model'

import { DateTime } from 'luxon'
import { Fragment } from 'react'

import styles from '../styles/Home.module.scss'

// TODO : replace DateTime.toFormat uses with DateTime.toLocaleString

function ConcertEvent({ quarter, concert }) {
    const repertoire = (concert.repertoire || quarter.repertoire);
    const collaborators = (concert.collaborators || quarter.collaborators);

    return (
        <>
            <p>
                Symphonic Chorus Performance: <span className={styles.time}>
                    <CommaSeparatedList>
                        {repertoire.main.map((p, index) => <PieceCitation key={index} data={p}/>)}
                    </CommaSeparatedList>
                    {collaborators &&
                        (<> with <CommaSeparatedList>{collaborators.map((c) => <Collaborator key={c} name={c}/>)}</CommaSeparatedList></>)
                    }
                </span>
            </p>
            <p>
                <TimeOfDay iso={concert.start}/> <Location name={concert.location}/>
            </p>
        </>
    );
}

function FirstRehearsalEvent({ quarter, rehearsal }) {
    return (
        <>
            <p>First rehearsal: <span><CommaSeparatedList>
                {quarter.repertoire.main.map((p, index) => <PieceCitation key={index} data={p}/>)}
            </CommaSeparatedList></span></p>
            <p className={styles.time}>
                <TimeOfDay iso={rehearsal.start}/> <Location name={rehearsal.location}/>
                <SpaceSeparatedPhrase>
                    .
                    {rehearsal.notes.map((n) => n)}
                </SpaceSeparatedPhrase>
            </p>
        </>
    );
}

function OtherEvent({ quarter, data }) {
    return (
        <>
            <p>{data.title}</p>
            <p><TimeOfDay iso={data.start}/> <Location name={data.location}/></p>
        </>
    );
}

function Introduction({ currentQuarter }) {
    var eventList = [];
    
    // add concerts to the event list
    eventList = eventList.concat(currentQuarter.concerts.map((c) => ({
        date: c.start,
        content: (<ConcertEvent quarter={currentQuarter} concert={c}/>),
    })));

    // add first rehearsal
    if (0 < currentQuarter.tuttiRehearsals.length) {
        eventList.push({
            date: currentQuarter.tuttiRehearsals[0].start,
            content: (<FirstRehearsalEvent quarter={currentQuarter} rehearsal={currentQuarter.tuttiRehearsals[0]}/>),
        });
    }

    // add current events to the list
    eventList = eventList.concat(currentQuarter.events.map((e) => ({
        date: e.start,
        content: (<OtherEvent quarter={currentQuarter} data={e}/>),
    })));

    // sort the event list into increasing date order
    eventList.sort((a, b) => compareISODate(a.date, b.date));

    return (
        <div className={styles.events}>
            <TitledSegment title="Events">
                <Lightbox image="/images/home/MemChu.jpg"
                    width={1314}
                    height={852}
                    caption="Memorial Church, 22 February 2010. Photo by R. A. Wilson."
                    img_width={149}/>
                {eventList.map((e, index) => (
                    <div key={index} className={styles.event}>
                        <h3 className={styles.date}>
                            <span className={styles.day}><DayOfMonth iso={e.date}/></span> <span className={styles.month}><Month iso={e.date}/><br/>
                            <Year iso={e.date}/></span>
                        </h3>
                        <div className={styles.eventList}>
                            {e.content}
                        </div>
                    </div>))}
            </TitledSegment>
        </div>
    );
}

function Sidebar({ quarter }) {
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
                    <li><PageLink collection="performances" page={quarter}><a>Rehearsal Schedule</a></PageLink></li>
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

export default function Home({ currentQuarter }) {
    return (
        <Layout
            title="Stanford Symphonic Chorus"
            introduction={<Introduction currentQuarter={currentQuarter}/>}
            sidebar={<Sidebar quarter={currentQuarter}/>}>
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
                    <div className={styles.performanceDescription}>
                        <h3><PageLink page="performanceList"><a>{currentQuarter.quarter} Concert</a></PageLink></h3>
                        {currentQuarter.heraldImageRoutes &&
                            <div className={styles.heraldImage}>
                                <PairedImage routes={currentQuarter.heraldImageRoutes}/>
                            </div>
                        }
                        <Markdown mdx={currentQuarter.descriptionMDX} />
                        <p>
                            {currentQuarter.concerts.length == 1 ? "Performance at " : "Performances at "} <Location name={currentQuarter.concerts[0].location}/> on <CommaSeparatedList>{currentQuarter.concerts.map((c, index) => <Fragment key={index}>{DateTime.fromISO(c.start).toFormat('EEEE, MMMM d')}</Fragment>)}</CommaSeparatedList>
                        </p>
                        <br/>
                        <ul className={styles.ticketLinks}>
                            <li><a href="//liveticket.stanford.edu/single/SelectSeatingSYOS.aspx?p=4634&z=182&pt=47,2,4,5,12,16">Tickets for Friday 15 March</a></li>
                            <li><a href="//liveticket.stanford.edu/single/SelectSeatingSYOS.aspx?p=4635&z=182&pt=47,2,4,5,12,16">Tickets for Sunday 17 March</a></li>
                        </ul>
                    </div>
                    <div>
                        <Covid19MitigationPolicy/>
                    </div>
                </TitledSegment>
            </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.getModel();
    
    const props = {
        currentQuarter: await model.currentQuarter.getStaticProps()
    }

    return {
        props: props
    }
}

// Setting unstable_runtimeJS to false removes all Next.js/React scripting from
// the page when it is exported. This creates a truly static HTML page, but
// should be used with caution because it does remove all client-side React
// processing. So, the page needs to be truly static, or the export will yield
// a page that is incorrect.
export const config = {
    unstable_runtimeJS: false
};
