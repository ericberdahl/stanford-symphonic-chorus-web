import PageLink, { isCurrentPage } from './pageLink'

import styles from '../styles/navTopic.module.scss'

function NavItem({ page, children }) {
    return (<li className={isCurrentPage(page) ? styles.current : ''}><PageLink page={page}><a>{children}</a></PageLink></li>);
}

export default function NavTopic(props) {
    return (
        <div className={styles.navTopic}>
            <ul>
                <NavItem page="home">Symphonic Chorus Home</NavItem>
                <NavItem page="about">About the Chorus</NavItem>
                <NavItem page="performanceList">Performances</NavItem>
                <NavItem page="memberInfo">Member Information</NavItem>
                <NavItem page="contactUs">Contact</NavItem>
            </ul>
        </div>
    );
}
