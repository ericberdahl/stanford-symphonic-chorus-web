import AboutUs from '../components/aboutUs'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import Person from '../components/person'

export default function Contact() {
    const title = "Contact Information";
    const breadcrumbPath = [
        ['/', 'Symphonic Chorus Home'],
        ['', 'Contact Information']
    ];

    const introduction = (
        <>
            <div>Contact</div>
            <div>For more information about the chorus or auditions, conatct <Person role="director" subject="Re: Information about SSC or auditions"/>.</div>
        </>
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
			    <img src="/images/SteveSano2014.jpg" width="323" height="201" alt="Sano conducting rehearsal" />
            </div>
        </Layout>
    );
}
