import Head from 'next/head'

const roles = {
    webmaster: {
        full_name: "Eric Berdahl",
        email: "berdahl",
        domain: "serendipity",
        long_tld: "organize",
        obscure_tld: "-o-r-g-"
    },

    director: {
        full_name: "Stephen M. Sano",
        email: "sano",
        domain: "stanford",
        long_tld: "educator",
        obscure_tld: "-e-d-u-",
    },

    administrator: {
        full_name: "Frances Molyneux",
        email: "frances2",
        domain: "stanford",
        long_tld: "educator",
        obscure_tld: "-e-d-u-",
    },

    w2010_photographer: {
        full_name: "R. A. Wilson",
        email: "R.A.Wilson",
        domain: "gmail",
        long_tld: "commuter",
        obscure_tld: "-c-o-m-"
    }
};

export default function Person(props) {
    const person = roles[props.role];
    const message = Object.assign({}, person);
    message.subject = "SSC Website Feedback"
    const data = JSON.stringify(message);

    return (
        <>
            <Head>
                <script src="/scripts/emus.js" type="text/javascript" key="emus.js"></script>
            </Head>
            <a className="personal_citation" data={data}>{person.full_name}</a>
            <noscript>{person.full_name}: {person.email}/AT/{person.domain}/DOT/{person.obscure_tld}/</noscript>
        </>
    );
}
