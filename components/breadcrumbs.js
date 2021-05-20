import Link from 'next/link'

import { Fragment } from 'react'

import styles from '../styles/breadcrumbs.module.scss'

export default function Breadcrumbs({ path }) {
    return (
        <div className={styles.breadcrumb}>
            <p>
                {path.map((item) => {
                        return (item[0] == '' ? 
                            (<Fragment key={item[1]}>{item[1]}</Fragment>) :
                            (<Fragment key={item[1]}><Link href={item[0]}><a>{item[1]}</a></Link>  » </Fragment>));
                }) }
            </p>
        </div>
    )
}
