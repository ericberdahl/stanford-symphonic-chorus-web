import { Fragment } from 'react'

import SpaceSeparatedPhrase from './spaceSeparatedPhrase'
import PageLink from './pageLink'

import styles from '../styles/breadcrumbs.module.scss'

function BreadcrumbItem({ item }) {
    return ('' == item.page ? 
        item.label :
        <PageLink page={item.page}>{item.label}</PageLink>);
}

export default function Breadcrumbs({ path }) {
    return (
        <div className={styles.breadcrumb}>
            <p>
                <SpaceSeparatedPhrase separator=" » ">
                    {path.map((item) => <BreadcrumbItem key={item} item={item}/>)}
                </SpaceSeparatedPhrase>
            </p>
        </div>
    )
}
