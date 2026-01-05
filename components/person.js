import getConfig from 'next/config'
import Head from 'next/head'
import { useRouter } from 'next/router';


const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export default function Person({ role, subject }) {
    const router = useRouter();

    const person = publicRuntimeConfig.people[role];
    const message = Object.assign({}, person);
    message.subject = subject;
    const data = JSON.stringify(message);

    return (
        <>
            <Head>
                // TODO investigate using next/script tag with beforeInteractive strategy (https://nextjs.org/docs/messages/no-script-tags-in-head-component)
                <script src={`${router.basePath}/scripts/emus.js`} key="/scripts/emus.js" />
            </Head>
            <a className="personal_citation" data={data}>{person.full_name}</a>
            <noscript>{person.full_name}: {person.email}/AT/{person.domain}/DOT/{person.obscure_tld}/</noscript>
            {person.title && (" " + person.title)}
        </>
    );
}
