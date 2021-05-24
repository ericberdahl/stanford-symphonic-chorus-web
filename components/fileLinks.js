import { Fragment } from 'react';

import SpaceSeparatedPhrase from './spaceSeparatedPhrase';

export default function FileLinks(props) {
    return (
        <SpaceSeparatedPhrase separator=' | '>
            {props.files.map((f) => <a key={f.variant} href={f.route}>{f.variant}</a>)}
        </SpaceSeparatedPhrase>
    );
}
