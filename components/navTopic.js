import { useRouter } from 'next/router'

import styles from '../styles/navTopic.module.scss'

export default function NavTopic(props) {
    const router = useRouter();

    const topics = [
        ['index', 'Symphonic Chorus Home'],
        ['about', 'About the Chorus'],
        ['performances', 'Performances'],
        ['MemberPage', 'Member Information'],
        ['contact', 'Contact'],
    ];

    const listItems = topics.map((item) => {
        const link = ( <a href={item[0] + '.html'}>{item[1]}</a> );
        return (router.pathname == "/" + item[0] ? 
                    (<li key={item[0]} className={styles.current}>{link}</li>) :
                    (<li key={item[0]}>{link}</li>));
    });
    
    return (
        <div className={styles.navTopic}>
            <ul>
                {listItems}
            </ul>
        </div>
    );
}
