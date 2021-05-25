import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '../styles/navTopic.module.scss'

export default function NavTopic(props) {
    const router = useRouter();

    const topics = [
        ['index', 'Symphonic Chorus Home'],
        ['about', 'About the Chorus'],
        ['performances', 'Performances'],
        ['memberinfo', 'Member Information'],
        ['contact', 'Contact'],
    ];

    return (
        <div className={styles.navTopic}>
            <ul>
                {topics.map((item) => {
                    const link = ( <a href={item[0] + '.html'}>{item[1]}</a> );
                    const className = (router.pathname == "/" + item[0] ? styles.current : '');
                    return (<li key={item[0]} className={className}><Link href={item[0]} as={item[0] + '.html'}><a>{item[1]}</a></Link></li>);
                })}
            </ul>
        </div>
    );
}
