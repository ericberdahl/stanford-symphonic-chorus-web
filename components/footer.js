import Person from './person'
import PageLink from './pageLink'

import styles from '../styles/footer.module.scss'

// TODO: extra-vcards block

export default function Footer(props) {
    return (
        <div className={styles.footer}>
            <ul className={styles.nav}>
                <li><a href="//www.stanford.edu" title="Stanford University">Stanford University</a></li>
                <li><a href="//music.stanford.edu" title="Stanford Music Department">Stanford Music Department</a></li>
                <li><a href="//music.stanford.edu/Ensembles/index.html">Stanford Music Ensembles</a></li>
                <li className={styles.last}><PageLink page="home">Stanford Symphonic Chorus</PageLink></li>
            </ul>
            <div className={styles.copyright}>
                <p>
                    Website work by <Person role="webmaster" subject="SSC Website feedback"/>.
                </p>
                {/* {#block "extra-vcards"}}
                {{/block} */}
                <p>
                    &copy; Stanford University. 450 Serra Mall, Stanford, California 94305. (650) 723-2300. <a href="http://www.stanford.edu/site/terms.html">Terms of Use</a> | <a href="http://www.stanford.edu/site/copyright.html">Copyright Complaints</a>
                </p>
            </div>
        </div>
    );
}
