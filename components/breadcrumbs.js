import Link from 'next/link'

import styles from '../styles/breadcrumbs.module.scss'

export default function Breadcrumbs(props) {
    const paths = props.path.map((item) => {
        return (item[0] == '' ? 
            (<>{item[1]}</>) :
            (<><Link href={item[0]}><a>{item[1]}</a></Link>  » </>));

    });

    return (
        <div className={styles.breadcrumb}>
            <p>
                {paths}
            </p>
        </div>
    )
}
