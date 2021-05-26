import Link from 'next/link'

import Lightbox from '../components/lightbox'

import styles from '../styles/aboutUs.module.scss'

export default function AboutUs(props) {
    return (
        <div className={styles.about_us}>
            <h2>More About Us</h2>
            <Lightbox
                image="/images/MemChuReh.jpg"
                width={800}
                height={533}
                caption="Rehearsal, Memorial Church, 25 February 2010. Photo by R. A. Wilson"
                img_width={149}/>

            <h3><Link href="/memberinfo#joining" as="/memberinfo.html#joining"><a>How to Join</a></Link></h3>
            <p>See <em><Link href="/memberinfo#joining" as="/memberinfo.html#joining"><a>Joining the Chorus</a></Link></em> for information on auditions and basic member requirements.</p>

            <h3><Link href="/memberinfo" as="/memberinfo.html"><a>Member Information</a></Link></h3>
            <p>See our member page for information about rehearsals, and information and member resources. </p>

            <h3><Link href="/performances" as="/performances.html"><a>Performances</a></Link></h3>
            <p>Information about upcoming and past performances, including posters and photos and ticket information.</p>
        </div>
    );
}
