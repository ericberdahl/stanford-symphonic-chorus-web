import TitledSegment from '../components/titledSegment'

import styles from '../styles/chinaTour.module.scss'

export default function ChinaTour() {
    return (
        <TitledSegment title="Coverage of the 2008 China Music Tour">
            <div className={styles.chinaTour}>
                <p>
                    Stanford Alumni Magazine
                    The Alumni magazine featured a story.
                </p>
                <p>
                    Stanford Chamber Chorale 2008 China Tour
                    Photos by members of the Stanford Chamber Chorale.
                </p>
                <p>
                    Flickr Photos
                    Photos posted by tour participants
                </p>
            </div>
        </TitledSegment>
    );
}

