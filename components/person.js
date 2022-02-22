import { Script } from './htmlToolkit';

import getConfig from 'next/config'
import Head from 'next/head'

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export default function Person({ role, subject }) {
    const person = publicRuntimeConfig.people[role];
    const message = Object.assign({}, person);
    message.subject = subject;
    const data = JSON.stringify(message);

    return (
        <>
            <Head>
                <Script src="/scripts/emus.js" key="/scripts/emus.js"/>
            </Head>
            <a className="personal_citation" data={data}>{person.full_name}</a>
            <noscript>{person.full_name}: {person.email}/AT/{person.domain}/DOT/{person.obscure_tld}/</noscript>
            {person.title && (" " + person.title)}
        </>
    );
}
