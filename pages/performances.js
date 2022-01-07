import ChinaTour from '../components/chinaTour'
import CommaSeparatedList from '../components/commaSeparatedList'
import Collaborator from '../components/collaborator'
import FileLinks from '../components/fileLinks'
import Layout from '../components/layout'
import Location from '../components/location'
import PageLink from '../components/pageLink'
import PairedImage from '../components/pairedImage'
import PieceCitation from '../components/pieceCitation'
import TitledSegment from '../components/titledSegment'

import Model from '../common/model'
import { performanceStaticProps } from '../common/performanceStaticProps'

import { DateTime } from 'luxon'

import styles from '../styles/performances.module.scss'

function Introduction({ performances }) {
    let years = [];
    performances.forEach((p) => {
        const year = DateTime.fromISO(p.concerts[0].start).year;
        if (0 == years.length || years[years.length - 1].year != year) {
            years.push({ year: year, id: p.id });
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
                    {years.map((y) => <li key={y.year}><a href={'#' + y.id}>{y.year}</a></li>)}
                </ol>
            </TitledSegment>
        </div>
    );
}

function Sidebar() {
    return (
        <div className={styles.sidebar}>
            <ChinaTour/>
        </div>
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
                return (<p key={index}>{DateTime.fromISO(c.start).toFormat('DDDD, t')}, <Location name={c.location}/></p>);
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

    // TODO: add fylp links
    // TODO: add misc links
    return (
        <div id={data.id} className={styles.performance}>
            <div className={styles.poster}>
                <PairedImage routes={data.posterRoutes ? data.posterRoutes : data.heraldImageRoutes}/>
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
                    {data.repertoire.filter((p) => p.fylp).map((p, index) => (
                        <li key={index}><PageLink page={p.fylp} collection="fylp"><a>For Your Listening Pleasure: <PieceCitation data={p}/></a></PageLink></li>
                    ))}
                    {data.galleries.map((g) => (
                        <li key={g.id}><PageLink page={g} collection="gallery"><a>Photo Gallery: {g.name}</a></PageLink></li>
                    ))}
                    <li>TODO: links</li>
                </ul>
            </div>
        </div>
    );
}

export default function Performances({ performances }) {
    const title = "Performances";
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: '', label: title }
    ];

    return (
        <Layout
            title={title}
            introduction={<Introduction performances={performances}/>}
            sidebar={<Sidebar/>}
            breadcrumbs={breadcrumbPath}>
            <div>
                {performances.map((p) => {
                    return (<Performance key={p.quarter} data={p}/>);
                })}
            </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    
    const props = {
        performances: await Promise.all(model.performanceHistory.map(performanceStaticProps))
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
