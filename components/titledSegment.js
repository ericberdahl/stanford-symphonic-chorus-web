import styles from '../styles/titledSegment.module.scss'

export default function TitledSegment(props) {
    return (
        <div className={styles.segment}>
            <h2 className={styles.title}>{props.title}</h2>
            <div className={styles.content}>{props.children}</div>
        </div>
    );
}
