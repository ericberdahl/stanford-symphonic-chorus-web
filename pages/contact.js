import AboutUs from '../components/aboutUs'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import Person from '../components/person'
import TitledSegment from '../components/titledSegment'

import { useRouter } from 'next/router'

export default function Contact() {
    const router = useRouter();

    const title = "Contact Information";
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: '', label: title }
    ];

    const introduction = (
        <TitledSegment title="Contact">
            For more information about the chorus or auditions, conatct <Person role="administrator" subject="Re: Information about SSC or auditions"/>.
        </TitledSegment>
    );

    const sidebar = (
        <>
            <div>
                <AboutUs/>
            </div>
            <div>
                <Lightbox
                    image="/images/Sano.jpg"
                    width={220}
                    height={291}
                    caption="Director of Music and Conductor Stephen Sano"
                    img_width={149}/>
            </div>
        </>
    );

    return (
        <Layout
            title={title}
            introduction={introduction}
            sidebar={sidebar}
            breadcrumbs={breadcrumbPath}>
            <div>
			    <img src={`${router.basePath}/images/SteveSano2014.jpg`} width={323} height={201} alt="Sano conducting rehearsal" />
            </div>
        </Layout>
    );
}

// Setting unstable_runtimeJS to false removes all Next.js/React scripting from
// the page when it is exported. This creates a truly static HTML page, but
// should be used with caution because it does remove all client-side React
// processing. So, the page needs to be truly static, or the export will yield
// a page that is incorrect.
export const config = {
    unstable_runtimeJS: false
};
