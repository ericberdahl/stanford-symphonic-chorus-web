import Layout from "../../components/layout";
import Markdown from "../../components/Markdown";

import Model from "../../common/model";
import { makeSlug } from "../../common/slug";

import { supplementStaticProps } from '../../common/supplementStaticProps'

export default function SupplementPage({ supplement  }) {
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: 'performanceList', label: 'Performances' },
        { page: '', label: supplement.breadcrumb }
    ];

    return (
        <Layout
            title={supplement.title}
            introduction={<></>}
            sidebar={<></>}
            breadcrumbs={breadcrumbPath}>
            <Markdown mdx={supplement.contentMDX}/>
        </Layout>
    );
}

export async function getStaticProps({ params }) {
    const model = await Model.singleton;

    const supplement = model.supplements.find((s) => makeSlug(s.breadcrumb) == params.id);

    const props = {
        supplement: await supplementStaticProps(supplement)
    }

    return {
        props: props
    }
}

export async function getStaticPaths() {
    const model = await Model.singleton;

    const result = {
        paths: model.supplements.map((s) => ({ params: { id: makeSlug(s.breadcrumb) }}) ),
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
