import TitledSegment from './titledSegment'

import styles from '../styles/pageNavigation.module.scss'

export default function PageNavigation(props) {
    const listItems = props.items.map((item) => ( <li key={item[0]}><a href={item[0]}>{item[1]}</a></li> ) );

    return (
        <TitledSegment title="Contents">
            <div className={styles.page_navigation}>
                <ul>
                    {listItems}
                </ul>
            </div>
        </TitledSegment>
    );
}
