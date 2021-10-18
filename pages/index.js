import Collaborator from '../components/collaborator'
import CommaSeparatedList from '../components/commaSeparatedList'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import Location from '../components/location'
import Markdown from '../components/Markdown'
import PageLink from '../components/pageLink'
import PairedImage from '../components/pairedImage'
import PieceCitation from '../components/pieceCitation'
import SpaceSeparatedPhrase from '../components/spaceSeparatedPhrase'
import TitledSegment from '../components/titledSegment'

import Model from '../common/model'
import { pieceStaticProps } from '../common/pieceStaticProps'

import { DateTime } from 'luxon'
import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'
import { Fragment } from 'react'

import styles from '../styles/Home.module.scss'

function ConcertEvent({ currentQuarter, data }) {
    return (
        <>
            <p>
                Symphonic Chorus Performance: <span className={styles.time}>
                    <CommaSeparatedList>
                        {currentQuarter.mainPieces.map((p, index) => <PieceCitation key={index} data={p}/>)}
                    </CommaSeparatedList>
                    {currentQuarter.collaborators &&
                        (<> with <CommaSeparatedList>{currentQuarter.collaborators.map((c) => <Collaborator key={c} name={c}/>)}</CommaSeparatedList></>)
                    }
                </span>
            </p>
            <p>
                {DateTime.fromISO(data.start).toFormat('t')} <Location name={data.location}/>
            </p>
        </>
    );
}

function FirstRehearsalEvent({ currentQuarter, data }) {
    return (
        <>
            <p>First rehearsal: <span><CommaSeparatedList>
                {currentQuarter.mainPieces.map((p, index) => <PieceCitation key={index} data={p}/>)}
            </CommaSeparatedList></span></p>
            <p className={styles.time}>
                {DateTime.fromISO(data.start).toFormat('t')} <Location name={data.location}/>
                <SpaceSeparatedPhrase>
                    .
                    {data.notes.map((n) => n)}
                </SpaceSeparatedPhrase>
            </p>
        </>
    );
}

function OtherEvent({ currentQuarter, data }) {
    return (
        <>
            <p>{data.title}</p>
            <p>{DateTime.fromISO(data.start).toFormat('t')} <Location name={data.location}/></p>
        </>
    );
}

function Introduction({ currentQuarter }) {
    var eventList = [];
    
    // add concerts to the event list
    eventList = eventList.concat(currentQuarter.concerts.map((c) => ({
        date: DateTime.fromISO(c.start),
        data: c,
        renderer: ConcertEvent,
    })));

    // add first rehearsal
    if (currentQuarter.firstRehearsal) {
        eventList.push({
            date: DateTime.fromISO(currentQuarter.firstRehearsal.start),
            data: currentQuarter.firstRehearsal,
            renderer: FirstRehearsalEvent,
        });
    }

    // add current events to the list
    eventList = eventList.concat(currentQuarter.events.map((e) => ({
        date: DateTime.fromISO(e.start),
        data: e,
        renderer: OtherEvent,
    })));

    // sort the event list into increasing date order
    eventList.sort((a, b) => -b.date.diff(a.date).toMillis());

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
                            <span className={styles.day}>{e.date.toFormat('d')}</span> <span className={styles.month}>{e.date.toFormat('MMM')}<br/>
                            {e.date.toFormat('yyyy')}</span>
                        </h3>
                        <div className={styles.eventList}>
                            <e.renderer key={index} currentQuarter={currentQuarter} data={e.data}/>
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
                </TitledSegment>
            </div>
        </Layout>
    );
}

function serializeConcert(concert) {
    return {
        start:      concert.start.toISO(),
        location:   concert.location
    };
}

function serializeEvent(event) {
    return {
        start:      event.start.toISO(),
        location:   event.location,
        title:      event.title,
    };
}

function serializeTuttiRehearsal(rehearsal) {
    if (!rehearsal) return null;

    return {
        start: rehearsal.start.toISO(),
        end: rehearsal.end.toISO(),
        location: rehearsal.location,
        notes: rehearsal.notes,
    }
}

function serializeImageRoutes(imageRoutes) {
    if (!imageRoutes) {
        return null;
    }

    const result = {
        pdf: imageRoutes?.pdf || null,
        jpg: imageRoutes?.jpg || null,
        caption: imageRoutes?.caption || null,
        width: imageRoutes.width,
        height: imageRoutes.height,
    };

    return result;
}

async function serializePerformance(performance) {
    return {
        collaborators:      performance.collaborators,
        concerts:           performance.concerts.map(serializeConcert),
        descriptionMDX:     await mdxSerializeMarkdown(performance.description),
        events:             performance.events.map(serializeEvent),
        firstRehearsal:     serializeTuttiRehearsal(performance.tuttiRehearsals[0]),
        heraldImageRoutes:  serializeImageRoutes(performance.heraldImageRoutes),
        id:                 performance.id,
        mainPieces:         performance.mainPieces.map(pieceStaticProps),
        repertoire:         performance.repertoire.map(pieceStaticProps),
        quarter:            performance.quarter,
    };
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    
    const props = {
        currentQuarter: await serializePerformance(model.currentQuarter)
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
