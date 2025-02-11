import AboutUs from '../components/aboutUs'
import Layout from '../components/layout'
import Lightbox from '../components/lightbox'
import PageNavigation from '../components/pageNavigation'

import styles from '../styles/about.module.scss'

export default function About() {
    const title = "About Stanford Symphonic Chorus";
    const navItems = [
        ['#c1', 'About the Chorus'],
        ['#c2', 'About the Conductor']
    ];
    const breadcrumbPath = [
        { page: 'home', label: 'Symphonic Chorus Home' },
        { page: '', label: title }
    ];

    const introduction = (
        <>
            <PageNavigation items={navItems}/>
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
            <div className={styles.content}>
                <h2 id="c1">About the Chorus</h2>
                <p>The Stanford Symphonic Chorus is the largest choral ensemble on the Stanford campus and comprises 200 singers including students, faculty, staff and community members at large, under the baton of Director of Music and Conductor Stephen M. Sano. The ensemble specializes in major masterworks for chorus and orchestra and has performed most of the standard corpus of masterworks literature. Students may take Chorus as a credit course within the Music Department (Music 162/Music 162Z).</p>
                <p>The Chorus generally presents three different concert programs per year, one each academic quarter, and collaborates regularly with the Peninsula Symphony and the Stanford Symphony Orchestra. A concert program typically features a major choral-orchestral masterwork, often alongside other choral or purely instrumental pieces. The summer term features the Stanford Summer Chorus, an unauditioned ensemble open to singers of all ages and ability levels, which  performs in early August.</p>

                <h2 id="c2">About the Conductor</h2>
                <p>Stephen M. Sano, Professor of Music at Stanford University, assumed the position of Director of Choral Studies in 1993. At Stanford, Dr. Sano directs the Stanford Chamber Chorale and Symphonic Chorus, where he has been described as “a gifted conductor,” and his work as “Wonderful music making! ... evident in an intense engagement with his charges: the musicians responded to this attention with wide-eyed musical acuity.” Other reviews have lauded, “It is difficult to believe that any choral group anywhere is capable of performing better than the Stanford chorus under the direction of Stephen M. Sano.”</p>
                <p>Dr. Sano has appeared as guest conductor with many of the world’s leading choral organizations including in collaborative concerts with the Choir of Trinity College, Cambridge; the Joyful Company of Singers (London); the Choir of Royal Holloway, University of London; the Kammerchor der Universität der Künste Berlin; and the Kammerchor der Universität Wien (Vienna). He often appears as guest conductor of the Peninsula Symphony Orchestra in its collaborative concerts with the Stanford Symphonic Chorus, and has served on the conducting faculty of the Wilkes University Encore Music Festival of Pennsylvania. He has studied at the Tanglewood Music Center and is in frequent demand as a master class teacher, conductor, and adjudicator in choral music. To date, he has taught master classes and conducted festival, honor, municipal, and collegiate choirs from over 20 states, as well as from England, Austria, Germany, Canada, Australia, and Japan.</p>
                <p>On Stanford campus, Dr. Sano’s accomplishments as a leader and educator have been recognized through his appointments as the inaugural chair holder of the Professor Harold C. Schmidt Directorship of Choral Studies and as the Rachford and Carlota A. Harris University Fellow in Undergraduate Education at Stanford University. He was also the recipient of the 2005 Dean’s Award for Distinguished Teaching.</p>
                <p>Outside of the choral world, Dr. Sano is a scholar and performer of kī hō ʻalu (Hawaiian slack key guitar), and an avid supporter of North American Taiko (Japanese American drumming). As a slack key artist, his recordings have been nominated as finalists for the prestigious Nā Hōkū Hanohano Award and the Hawaiian Music Award. His recording, Songs from the Taro Patch, was on the preliminary ballot for the 2008 Grammy Award. Dr. Sano’s recordings can be heard on the ARSIS Audio, Pictoria, and Daniel Ho Creations labels (choral); and the Daniel Ho Creations and Ward Records labels (slack key guitar).</p>
                <p>A native of Palo Alto, California, Dr. Sano holds Master’s and Doctoral  degrees in both orchestral and choral conducting from Stanford, and a Bachelor’s degree in piano performance and theory from San José State University.</p>
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
