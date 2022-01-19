import Layout from "../../components/layout";
import Lightbox from "../../components/lightbox";

import { Model } from "../../common/model";

import styles from '../../styles/gallery.module.scss';

export default function Gallery({ gallery }) {
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: 'performanceList', label: 'Performances' },
        { page: '', label: gallery.name }
    ];

    // TODO: look at sizing of content column in the gallery pages

    return (
        <Layout
            title={gallery.title}
            breadcrumbs={breadcrumbPath}>
                <div className={styles.gallery}>
                    {gallery.items.map((i) => (
                        <div key={i.image} className={styles.item}>
                            <Lightbox
                                gallery="g"
                                display={i.thumb}
                                img_width={i.thumb_width}
                                img_height={i.thumb_height}
                                image={i.image} />
                        </div>
                    ))}
                </div>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;
    
    const gallery = model.galleries.find((g) => (g.id == params.id));

    const props = {
        gallery: await gallery.getStaticProps()
    }

    return {
        props: props
    }
}

export async function getStaticPaths() {
    const model = await Model.singleton;

    const result = {
        paths: model.galleries.map((g) => ({ params: {
            id: g.id,
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
