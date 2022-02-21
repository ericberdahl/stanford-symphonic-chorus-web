import ChinaTour from '../components/chinaTour';
import Layout from '../components/layout';
import PageLink from '../components/pageLink';
import PieceCitation from '../components/pieceCitation';
import TitledSegment from '../components/titledSegment';

import { Model } from '../common/model';
import { repertoireStaticProps } from '../common/repertoireStaticProps'
import { makeSlug } from '../common/slug';

import styles from '../styles/fylpIndex.module.scss'

function composerFullName(composer) {
    return (composer.fullName == '' ? 'unknown' : composer.fullName);
}

function Introduction({ repertoire }) {
    return (
        <TitledSegment title="For Your Listening Pleasure">
            <div className={styles.introduction}>
                <div className={styles.overview}>
                    Stanford Symphonic Chorus recommends recordings of other performances that you may enjoy, in addition to attending its concerts.
                </div>
                <h3>Composers</h3>
                <ol>
                    {repertoire.map((r, index) => (
                        <li key={index}><a href={'#' + makeSlug(composerFullName(r.composer))}>{composerFullName(r.composer)}</a></li>
                    ))}
                </ol>
            </div>
        </TitledSegment>
    );
}

function Sidebar() {
    return (
        <div>
            <ChinaTour/>
        </div>
    );
}

function SubRepertoire({ composer, pieces }) {
    return (
        <div id={makeSlug(composerFullName(composer))} className={styles.composerRepertoire}>
            <div>{composer.fullName}</div>
            <ol>
                {pieces.map((p, index) => (
                    <li key={index} className={styles.piece}>
                        <PageLink page={p.fylp} collection="fylp"><a><PieceCitation data={p} titleOnly/></a></PageLink>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function FYLP({ repertoire })
{
    const title = "For Your Listening Pleasure";

    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: '', label: title }
    ];

    return (
        <Layout
            title={title}
            introduction={<Introduction repertoire={repertoire}/>}
            sidebar={<Sidebar/>}
            breadcrumbs={breadcrumbPath}>
            <div>
                {repertoire.map((r, index) => (
                    <SubRepertoire key={index} composer={r.composer} pieces={r.pieces} />
                ))}
            </div>
        </Layout>
    );
}

export async function getStaticProps() {
    const model = await Model.getModel();
    
    const props = {
        repertoire: await repertoireStaticProps(model.fylp)
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
