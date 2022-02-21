import Lightbox from '../components/lightbox'
import TitledSegment from '../components/titledSegment'

import styles from '../styles/chinaTour.module.scss'

export default function ChinaTour() {
    return (
        <TitledSegment title="Coverage of the 2008 China Music Tour">
            <div className={styles.chinaTour}>
                <Lightbox
                    image="/images/SupremeHarmony.jpg"
                    width={600}
                    height={450}
                    caption="Near the Gate of Supreme Harmony at the Forbidden City in Beijing. Photo by Tom Sharp."
                    img_width={149}/>

                <h3><a href="http://www.stanfordalumni.org/news/magazine/2008/sepoct/farm/news/chinatour.html">Stanford Alumni Magazine</a></h3>
                <p>The Alumni magazine featured a story.</p>

                <h3><a href="http://chorale.stanford.edu/2008_tour_china/index.html">Stanford Chamber Chorale 2008 China Tour</a></h3>
                <p>Photos by members of the Stanford Chamber Chorale.</p>

                <h3><a href="http://www.flickr.com/groups/840050@N22/">Flickr Photos</a></h3>
                <p>Photos posted by tour participants</p>
            </div>
        </TitledSegment>
    );
}

