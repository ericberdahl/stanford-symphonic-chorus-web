import CommaSeparatedList from '../components/commaSeparatedList'
import Collaborator from '../components/collaborator'
import Layout from '../components/layout'
import Location from '../components/location'
import PieceCitation from '../components/pieceCitation'
import TitledSegment from '../components/titledSegment'

import Model from '../common/model'

import styles from '../styles/performances.module.scss'

import slugify from 'slugify'

function Introduction(props) {
    // TODO Finish introduction
    return (
        <div className={styles.introduction}>
            <TitledSegment title="Performances">
                <p>
                    Stanford Symphonic Chorus performs symphonic works three times a year - each academic quarter.
                </p>
            </TitledSegment>
        </div>
    );
}

function Sidebar(props) {
    // TODO Finish sidebar
    return (
        <div className={styles.sidebar}>
            <TitledSegment title="Coverage of the 2008 China Music Tour">
                <p>
                    Stanford Alumni Magazine
                    The Alumni magazine featured a story.
                </p>
                <p>
                    Stanford Chamber Chorale 2008 China Tour
                    Photos by members of the Stanford Chamber Chorale.
                </p>
                <p>
                    Flickr Photos
                    Photos posted by tour participants
                </p>
            </TitledSegment>
        </div>
    );
}

function Repertoire(props) {
    // TODO add repertoire
    return (
        <>
            <p>Repertoire:</p>
            <ul>
                {props.data.map((p, index) => {
                    return (<li key={index}><PieceCitation data={p}/></li>);
                })
                }
            </ul>
        </>
    );
}

function SoloistList(props) {
    if (0 == props.data.length) return (<></>);

    return (
        <>
            <p>With soloists:</p>
            <ul>
                {props.data.map((s) => {
                    return (<li key={s.name}>{s.name}, {s.part}</li>);
                    })
                }
            </ul>
        </>
    );
}

function CollaboratorList({ data }) {
    if (0 == data.length) return (<></>);

    return (
        <p>
            Performed with <CommaSeparatedList>{data.map((c) => <Collaborator key={c} name={c}/>)}</CommaSeparatedList>
        </p>
    );
}

function DirectorList({ data }) {
    if (0 == data.length) return (<></>);

    return (
        <p>
            Directed by <CommaSeparatedList>{data}</CommaSeparatedList>.
        </p>
    );
}

function ConcertList(props) {
    return (
        <>
            {props.data.map((c, index) => {
                return (<p key={index}>{c.start}, <Location name={c.location}/></p>);
            })}
        </>
    );
}

function Performance(props) {
    // TODO add poster

    // TODO add poster links
    // TODO add fylp links
    // TODO add misc links
    return (
        <div id={slugify(props.data.quarter)} className={styles.performance}>
            <div className={styles.poster}>
                <img src="/images/M@S-roundedges.gif" alt=""/>
            </div>
            <div className={styles.content}>
                <h3>{props.data.quarter}</h3>
                <Repertoire data={props.data.repertoire}/>
                <SoloistList data={props.data.soloists}/>
                <CollaboratorList data={props.data.collaborators}/>
                <DirectorList data={props.data.directors}/>
                <h4>Concerts:</h4>
                <ConcertList data={props.data.concerts}/>
            </div>
            <div className={styles.extras}>
                <ul className={styles.links}>
                    <li>TODO Poster</li>
                    <li>TODO FYLP</li>
                    <li>TODO links</li>
                </ul>
            </div>
        </div>
    );
}

export default function Performances({ pageData }) {
    const title = "Performances";
    const breadcrumbPath = [
        ['/', 'Symphonic Chorus Home'],
        ['', title]
    ];

    // TODO Finish perforamnce content
    return (
        <Layout
            title={title}
            introduction={<Introduction {...pageData}/>}
            sidebar={<Sidebar {...pageData}/>}
            breadcrumbs={breadcrumbPath}>
            <div>
                {pageData.performances.map((p) => {
                    return (<Performance key={p.quarter} data={p}/>);
                })}
            </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    const performances = model.performances.map((p) => {
        return {
            collaborators: p.collaborators,
            concerts: p.concerts.map((c) => {
                return {
                    start: c.start.toFormat('EEEE d MMMM yyyy, h:mma'),
                    location: c.location
                };
            }),
            directors: p.directors,
            instructors: p.instructors,
            repertoire: p.repertoire.map((piece) => {
                return {
                    arranger: piece.arranger,
                    catalog: piece.catalog,
                    commonTitle: piece.commonTitle,
                    composer: piece.composer,
                    movement: piece.movement,
                    prefix: piece.prefix,
                    suffix: piece.suffix,
                    title: piece.title,
                    translation: piece.translation,
                }
            }),
            soloists: p.soloists,
            quarter: p.quarter,
            year: p.concerts[0].start.year,
        }
    });
    
    const pageData = {
        performances: performances
    }

    return {
        props: { pageData }
    }
}