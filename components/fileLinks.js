import SpaceSeparatedPhrase from './spaceSeparatedPhrase';

import Link from 'next/link'

export default function FileLinks({ files }) {
    return (
        <SpaceSeparatedPhrase separator=' | '>
            {files.map((f, index) => <Link href={f.route} key={index}><a>{f.variant}</a></Link>)}
        </SpaceSeparatedPhrase>
    );
}
