import Layout from '../../../components/layout';
import Lightbox from '../../../components/lightbox';
import Markdown from '../../../components/markdown';
import PageLink from '../../../components/pageLink';
import PairedImage from '../../../components/pairedImage';
import PieceCitation from '../../../components/pieceCitation';
import TitledSegment from '../../../components/titledSegment';

import { Model }  from '../../../common/model';
import { makeSlug } from '../../../common/slug';

import styles from '../../../styles/fylpPiece.module.scss'

function Introduction({ fylp }) {
    return (
        <TitledSegment title="Contents">
            <div className={styles.introduction}>
                <ol>
                    {fylp.albums.map((a, index) => (
                        <li key={index}><a href={'#' + makeSlug(a.director)}>{a.director}</a></li>
                    ))}
                </ol>
            </div>
        </TitledSegment>
    );
}

function Sidebar({ fylp }) {
    return (
        <div>
            <Lightbox
                image="/images/Sano.jpg"
                width={220}
                height={291}
                caption="Director of Music and Conductor Stephen Sano"
                img_width={149}/>
            <div className={styles.performances}>
                <TitledSegment title="Performances">
                    <ol>
                        {Array.from(fylp.piece.performances).reverse().map((p, index) => (
                            <li key={index}><PageLink page={p} collection="performances">{p.quarter}</PageLink></li>
                        ))}
                    </ol>
                </TitledSegment>
            </div>
        </div>
    );
}

function Album({ album }) {
    return (
        <div id={makeSlug(album.director)} className={styles.album}>
            <h3>{album.director}</h3>
            {album.image && <div className={styles.image}><PairedImage routes={album.image} width={109}/></div>}
            <Markdown mdx={album.descriptionMDX} />
        </div>
    );
}

export default function FYLP({ fylp })
{
    const pageBreadcrumb = (<PieceCitation data={fylp.piece}/>);
    const pageTitle = (<>For Your Listening Pleasure - {pageBreadcrumb}</>);

    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: 'fylpList', label: 'For Your Listening Pleasure' },
        { page: '', label: pageBreadcrumb }
    ];

    return (
        <Layout
            title={pageTitle}
            introduction={<Introduction fylp={fylp}/>}
            sidebar={<Sidebar fylp={fylp}/>}
            breadcrumbs={breadcrumbPath}>
                <div className={styles.fylp}>
                    <h2><PieceCitation data={fylp.piece}/></h2>
                    <div className={styles.overallDescription}><Markdown mdx={fylp.descriptionMDX} /></div>
                    {fylp.albums.map((a, index) => (
                        <Album key={index} album={a} />
                    ))}
                </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.getModel();
    
    const piece = model.fylp.pieces.find((p) => (makeSlug(p.composer.fullName) == params.composer && makeSlug(p.title) == params.title));

    const props = {
        fylp:   await piece.fylp.getStaticProps()
    }

    return {
        props: props
    }
}

export async function getStaticPaths() {
    const model = await Model.getModel();
    
    const result = {
        paths: model.fylp.pieces.map((p) => ({ params: {
            composer: makeSlug(p.composer.fullName),
            title: makeSlug(p.title)
        }})),
        fallback: false
    };

    return result;
}

// Setting unstable_runtimeJS to false removes all Next.js/React scripting from
// the page when it is exported. This creates a truly static HTML page, but
// should be used with caution because it does remove all client-side React
// processing. So, the page needs to be truly static, or the export will yield
// a page that is incorrect.
export const config = {
    unstable_runtimeJS: false
};
