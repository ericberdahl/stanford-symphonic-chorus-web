import Layout from '../../../components/layout';
import Lightbox from '../../../components/lightbox';
import Markdown from '../../../components/Markdown';
import PageLink from '../../../components/pageLink';
import PairedImage from '../../../components/pairedImage';
import PieceCitation from '../../../components/pieceCitation';
import TitledSegment from '../../../components/titledSegment';

import Model  from '../../../common/model';
import { makeSlug } from '../../../common/slug';

import { serialize as mdxSerializeMarkdown } from 'next-mdx-remote/serialize'

import styles from '../../../styles/fylpPiece.module.scss'

function Introduction({ piece }) {
    return (
        <TitledSegment title="Contents">
            <div className={styles.introduction}>
                <ol>
                    {piece.fylp.albums.map((a, index) => (
                        <li key={index}><a href={'#' + makeSlug(a.director)}>{a.director}</a></li>
                    ))}
                </ol>
            </div>
        </TitledSegment>
    );
}

function Sidebar({ piece }) {
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
                        {piece.performances.map((p, index) => (
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

export default function FYLP({ piece })
{
    const pageBreadcrumb = (<PieceCitation data={piece}/>);
    const pageTitle = (<>For Your Listening Pleasure - {pageBreadcrumb}</>);

    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: 'fylpList', label: 'For Your Listening Pleasure' },
        { page: '', label: pageBreadcrumb }
    ];

    return (
        <Layout
            title={pageTitle}
            introduction={<Introduction piece={piece}/>}
            sidebar={<Sidebar piece={piece}/>}
            breadcrumbs={breadcrumbPath}>
                <div className={styles.fylp}>
                    <h2><PieceCitation data={piece}/></h2>
                    <div className={styles.overallDescription}><Markdown mdx={piece.fylp.descriptionMDX} /></div>
                    {piece.fylp.albums.map((a, index) => (
                        <Album key={index} album={a} />
                    ))}
                </div>
        </Layout>
    );
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

async function serializeAlbum(album) {
    return {
        director:       album.director,
        descriptionMDX: await mdxSerializeMarkdown(album.description),
        label:          album.label,
        image:          serializeImageRoutes(album.image),
        shopping:       album.shopping,

    };
}

async function serializeFYLP(fylp) {
    return {
        descriptionMDX: await mdxSerializeMarkdown(fylp.description),
        albums:         await Promise.all(fylp.albums.map(async (a) => serializeAlbum(a)))
    };
}

function serializeComposer(composer) {
    return {
        fullName:   composer.fullName,
        familyName: composer.familyName
    }
}

function serializePerformanceReference(performance) {
    return {
        id:         performance.id,
        quarter:    performance.quarter
    }
}

async function serializePieceForFYLP(piece) {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       serializeComposer(piece.composer),
        fylp:           await serializeFYLP(piece.fylp),
        movement:       piece.movement,
        prefix:         piece.prefix,
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
        performances:   piece.performances.map(serializePerformanceReference)
    };
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    
    const piece = model.fylp.pieces.find((p) => (makeSlug(p.composer.fullName) == params.composer && makeSlug(p.title) == params.title));

    const props = {
        piece: await serializePieceForFYLP(piece)
    }

    return {
        props: props
    }
}

export async function getStaticPaths() {
    const model = await Model.singleton;

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
