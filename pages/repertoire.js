import ChinaTour from '../components/chinaTour';
import Layout from '../components/layout'
import TitledSegment from '../components/titledSegment';

import Model from '../common/model'
import PieceCitation from '../components/pieceCitation';
import PageLink from '../components/pageLink';

import slugify from 'slugify'

import styles from '../styles/repertoirePage.module.scss'

function composerFullName(composer) {
    return (composer.fullName == '' ? 'unknown' : composer.fullName);
}

function Introduction({ repertoire }) {
    return (
        <TitledSegment title="Repertoire">
            <div className={styles.introduction}>
                <div className={styles.overview}>
                    Stanford Symphonic Chorus has performed many and varied pieces through the years.
                </div>
                <h3>Composers</h3>
                <ol>
                    {repertoire.map((r, index) => (
                        <li key={index}><a href={'#' + slugify(composerFullName(r.composer))}>{composerFullName(r.composer)}</a></li>
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
        <div id={slugify(composerFullName(composer))} className={styles.composerRepertoire}>
            <ol>
                {pieces.map((p, index) => (
                    <li key={index} className={styles.piece}>
                        <div className={styles.citation}><PieceCitation data={p}/></div>
                        <div className={styles.fylp}>TODO: FYLP citation</div>
                        <div className={styles.performances}>
                            {p.performances.map((pf, index) => (
                                <div key={index}><PageLink page={pf} collection="performances">{pf.quarter}</PageLink></div>
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default function Repertoire({ repertoire })
{
    const title = "Repertoire";

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

function serializePiece(piece) {
    return {
        arranger:       piece.arranger,
        catalog:        piece.catalog,
        commonTitle:    piece.commonTitle,
        composer:       serializeComposer(piece.composer),
        movement:       piece.movement,
        prefix:         piece.prefix,
        suffix:         piece.suffix,
        title:          piece.title,
        translation:    piece.translation,
        performances:   piece.performances.map(serializePerformanceReference)
    };
}

function serializeRepertoire(repertoire) {
    const composers = repertoire.getAllComposers();

    const result = composers.map((c) => {
        return {
            composer:   serializeComposer(c),
            pieces:     repertoire.getPiecesByComposer(c).map((p => serializePiece(p)))
        }
    });

    return result;
}

export async function getStaticProps() {
    const model = await Model.singleton;
    
    const props = {
        repertoire: serializeRepertoire(model.repertoire)
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
