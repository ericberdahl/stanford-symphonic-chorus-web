import Collaborator from '../components/collaborator'
import CommaSeparatedList from '../components/commaSeparatedList'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import Location from '../components/location'
import PageLink from '../components/pageLink'
import Person from '../components/person'
import PieceCitation from '../components/pieceCitation'
import TitledSegment from '../components/titledSegment'

import Model from '../common/model'

import { DateTime } from 'luxon'

import styles from '../styles/Home.module.scss'

function ConcertEvent({ currentQuarter, data }) {
    return (
        <>
            <p>
                Symphonic Chorus Performance: <span class="event_time">
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

function Introduction({ currentQuarter }) {
    var eventList = [];
    
    // add concerts to the event list
    eventList = eventList.concat(currentQuarter.concerts.map((c) => ({
        date: DateTime.fromISO(c.start),
        data: c,
        renderer: ConcertEvent
    })));

    // TODO : add first rehearsal
    // TODO : add other events

    // sort the event list into increasing date order
    eventList.sort((a, b) => b.date.diff(a.date).toMillis());

    return (
        <div className={styles.events}>
            <TitledSegment title="Events">
                <Lightbox image="/images/home/MemChu.jpg"
                    width={1314}
                    height={852}
                    caption="Memorial Church, 22 February 2010. Photo by R. A. Wilson."
                    img_width={149}/>
                {eventList.map((e, index) => (
                    <div class={styles.event}>
                        <h3>
                            <span class={styles.day}>{e.date.toFormat('d')}</span> <span class={styles.month}>{e.date.toFormat('MMM')}<br/>
                            {e.date.toFormat('yyyy')}</span>
                        </h3>
                        <e.renderer key={index} currentQuarter={currentQuarter} data={e.data}/>
                    </div>))}
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

export default function Home({ currentQuarter }) {
    return (
        <Layout
            title="Stanford Symphonic Chorus"
            introduction={<Introduction currentQuarter={currentQuarter}/>}
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
                    <div className={styles.performanceDescription}>
                        <h3><PageLink page="performanceList"><a>{currentQuarter.quarter} Concert</a></PageLink></h3>
                        <p>TODO use first image</p>
                        <div dangerouslySetInnerHTML={{ __html: currentQuarter.description }} />
                        <p>
                            {currentQuarter.concerts.length == 1 ? "Performance at " : "Performances at "} <Location name={currentQuarter.concerts[0].location}/> on <CommaSeparatedList>{currentQuarter.concerts.map((c, index) => <>{DateTime.fromISO(c.start).toFormat('EEEE, MMMM d')}</>)}</CommaSeparatedList>
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

function serializePiece(piece) {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       piece.composer,
        movement:       piece.movement,
        prefix:         piece.prefix,
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
    };
}

function serializePerformance(performance) {
    return {
        collaborators:  performance.collaborators,
        concerts:       performance.concerts.map(serializeConcert),
        description:    performance.description,
        /*
        directors:      performance.directors,
        instructors:    performance.instructors,
        posterRoutes:   serializePosters(performance.posterRoutes),
        */
        mainPieces:     performance.mainPieces.map(serializePiece),
        repertoire:     performance.repertoire.map(serializePiece),
        /*
        soloists:       performance.soloists,
        */
        quarter:        performance.quarter,
        /*
        year:           performance.concerts[0].start.year,
        */
    };
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    
    const props = {
        currentQuarter: serializePerformance(model.currentQuarter)
    }

    return {
        props: props
    }
}
