import Lightbox from '../components/lightbox'
import PageLink from '../components/pageLink'

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

            <h3><PageLink page="memberInfo" anchor="joining">How to Join</PageLink></h3>
            <p>See <em><PageLink page="memberInfo" anchor="joining">Joining the Chorus</PageLink></em> for information on auditions and basic member requirements.</p>

            <h3><PageLink page="memberInfo">Member Information</PageLink></h3>
            <p>See our member page for information about rehearsals, and information and member resources. </p>

            <h3><PageLink page="performanceList">Performances</PageLink></h3>
            <p>Information about upcoming and past performances, including posters and photos and ticket information.</p>
        </div>
    );
}
