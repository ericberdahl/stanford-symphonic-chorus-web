import Link from 'next/link'

import Collaborator from '../components/collaborator'
import Layout from '../components/layout'
import Location from '../components/location'
import TitledSegment from '../components/titledSegment'

import Model from '../common/model'

import { DateTime } from 'luxon'

import styles from '../styles/performances.module.scss'

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

function PieceCitation({ tag, data }) {
    tag = (tag ? tag : 'em');

    const EmTag = ({ children }) => {
        return (<em>{children}</em>);
    };
    const NoTag = ({ children }) => {
        return (<>{children}</>)
    };
    const Tag = ('em' == tag ? EmTag : NoTag);

    let items = [];
    if (data.composer) {
        items.push(data.composer);
        items.push(' ');
    }
    if (data.prefix) {
        items.push(data.prefix);
        items.push(' ')
    }
    if (data.movement) {
        items.push(<Tag>{data.movement}</Tag>);
        items.push(' from ')
    }

    const titles = [];
    if (Array.isArray(data.title)) {
        data.title.forEach((i) => {
            titles.push(<Tag>{i}</Tag>);
            titles.push(', ');
        });

        titles.pop();
        if (3 == titles.length) {
            titles[2] = ' and ';
        }
        else {
            titles[titles.length - 2] = ', and ';
        }
    }
    else {
        titles.push(<Tag>{data.title}</Tag>);
    }
    items = items.concat(titles);
    items.push(' ');

    if (data.translation) {
        items.push('(' + data.translation + ')');
        items.push(' ');
    }
    if (data.commonTitle) {
        items.push('"' + data.commonTitle + '"');
        items.push(' ');
    }
    if (data.catalog) {
        items.push(', ' + data.catalog);
        items.push(' ');
    }
    if (data.arranger) {
        items.push(', arranged by ' + data.arranger);
        items.push(' ');
    }
    if (data.suffix) {
        items.push(data.suffix);
        items.push(' ')
    }

    // Remove the trailing space if one exists
    if (' ' == items[items.length - 1]) {
        items.pop();
    }

    return (
        <span>
            {items}
        </span>
    );
    /*
    <em>{movement}</em> from
    <em>{title[0]}</em>, <em>{title[1]}</em>, ..., and <em>{title[N]}</em>
    ({translation})
    "{commonTitle}"
    , {catalog}
    , arranged by {arranger}   
    */
}

function Repertoire(props) {
    // TODO add repertoire
    return (
        <>
            <p>Repertoire:</p>
            <ul>
                {props.data.map((p) => {
                    return (<li><PieceCitation data={p}/></li>);
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

function CollaboratorList(props) {
    if (0 == props.data.length) return (<></>);

    let collaborators = [];
     props.data.forEach((c) => {
        collaborators.push(<Collaborator name={c}/>);
        collaborators.push(', ');
    });
    collaborators.pop();
    if (3 == collaborators.length) {
        collaborators[1] = ' and ';
    }
    else if (1 < collaborators.length) {
        collaborators.splice(-1, 0, 'and ');
    }

    return (
        <p>
            Performed with {collaborators}.
        </p>
    );
}

function DirectorList(props) {
    if (0 == props.data.length) return (<></>);

    let directors = [];
     props.data.forEach((d) => {
        directors.push(d);
        directors.push(', ');
    });
    directors.pop();
    if (3 == directors.length) {
        directors[1] = ' and ';
    }
    else if (1 < directors.length) {
        directors.splice(-1, 0, 'and ');
    }

    return (
        <p>
            Directed by {directors}.
        </p>
    );
}

function ConcertList(props) {
    return (
        <>
            {props.data.map((c) => {
                return (<p>{c.start}, <Location name={c.location}/></p>);
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
        <div className={styles.performance}>
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
        }
    });
    
    const pageData = {
        performances: performances
    }

    return {
        props: { pageData }
    }
}