import CommaSeparatedList from '../components/commaSeparatedList'
import Collaborator from '../components/collaborator'
import FileLinks from '../components/fileLinks'
import Layout from '../components/layout'
import Location from '../components/location'
import PieceCitation from '../components/pieceCitation'
import TitledSegment from '../components/titledSegment'

import Model from '../common/model'

import styles from '../styles/performances.module.scss'

import imageSize from 'image-size'
import slugify from 'slugify'

import path from 'path'
import Lightbox from '../components/lightbox'

function Introduction(pageData) {
    const PushPerformance = (p) => {
        years.push({ year: p.year, quarter: p.quarter });
    }

    let years = [];
    pageData.performances.forEach((p) => {
        if (0 == years.length || years[years.length - 1].year != p.year) {
            PushPerformance(p);
        }
    });

    return (
        <div className={styles.introduction}>
            <TitledSegment title="Performances">
                <p>
                    Stanford Symphonic Chorus performs symphonic works three times a year - each academic quarter.
                </p>
                <h3>Years</h3>
                <ol>
                    {years.map((y) => <li key={y.year}><a href={'#' + slugify(y.quarter)}>{y.year}</a></li>)}
                </ol>
            </TitledSegment>
        </div>
    );
}

function Sidebar(props) {
    // TODO Complete China Music Tour information -- move into its own component?
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

function Poster({ data }) {
    if (!data.posterRoutes.pdf) {
        return (<img src="/images/M@S-roundedges.gif" alt=""/>);
    };

    const MAX_DIMENSION = 900;
    const largestDimension = Math.max(data.posterRoutes.width, data.posterRoutes.width);
    const reductionFactor = (largestDimension < MAX_DIMENSION ? 1.0 : largestDimension/MAX_DIMENSION);
    const width = Math.round(data.posterRoutes.width/reductionFactor);
    const height = Math.round(data.posterRoutes.height/reductionFactor);
    
    return (
        <Lightbox
            image={data.posterRoutes.pdf}
            display={data.posterRoutes.jpg}
            width={width}
            height={height}
            caption={data.posterRoutes.caption}
            img_width={107}/>
    );
}

function Repertoire(props) {
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

function Performance({ data }) {
    const posterRoutes = [];
    if (data.posterRoutes?.pdf) {
        posterRoutes.push({ variant: 'PDF', route: data.posterRoutes.pdf });
    }
    if (data.posterRoutes?.jpg) {
        posterRoutes.push({ variant: 'JPG', route: data.posterRoutes.jpg });
    }

    // TODO add fylp links
    // TODO add misc links
    return (
        <div id={slugify(data.quarter)} className={styles.performance}>
            <div className={styles.poster}>
                <Poster data={data}/>
            </div>
            <div className={styles.content}>
                <h3>{data.quarter}</h3>
                <Repertoire data={data.repertoire}/>
                <SoloistList data={data.soloists}/>
                <CollaboratorList data={data.collaborators}/>
                <DirectorList data={data.directors}/>
                <h4>Concerts:</h4>
                <ConcertList data={data.concerts}/>
            </div>
            <div className={styles.extras}>
                <ul className={styles.links}>
                    {0 < posterRoutes.length && <li>Poster (<FileLinks files={posterRoutes}/>)</li>}
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

function serializeConcert(concert) {
    return {
        start:      concert.start.toFormat('EEEE d MMMM yyyy, h:mma'),
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

function serializePosters(posters) {
    const result = {
        pdf: posters?.pdf || null,
        jpg: posters?.jpg || null,
        caption: posters?.caption || null,
        width: 0,
        height: 0
    };

    if (result.jpg) {
        const imagePath = path.join(process.cwd(), 'public', result.jpg);
        ({ width: result.width, height: result.height } = imageSize(imagePath));
    }

    return result;
}

function serializePerformance(performance) {
    return {
        collaborators:  performance.collaborators,
        concerts:       performance.concerts.map(serializeConcert),
        directors:      performance.directors,
        instructors:    performance.instructors,
        posterRoutes:   serializePosters(performance.posterRoutes),
        repertoire:     performance.repertoire.map(serializePiece),
        soloists:       performance.soloists,
        quarter:        performance.quarter,
        year:           performance.concerts[0].start.year,
    };
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    const performances = model.performances.map(serializePerformance);
    
    const pageData = {
        performances: performances
    }

    return {
        props: { pageData }
    }
}