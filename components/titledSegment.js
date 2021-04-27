import styles from '../styles/titledSegment.module.scss'

export default function TitledSegment(props) {
    return (
        <div className={styles.segment}>
            <h2>{props.title}</h2>
            <div>{props.children}</div>
        </div>
    );
}
