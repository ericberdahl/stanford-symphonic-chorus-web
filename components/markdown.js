import { IFrame } from './htmlToolkit'

import { MDXRemote } from 'next-mdx-remote'

function YouTube({ video }) {
    const srcURL = "https://www.youtube.com/embed/" + video;

    return (
        <IFrame width="560" height="315"
                src={srcURL}
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen />
    );
}

const components = {
    YouTube,
}

export default function Markdown({ mdx }) {
    return (
        <MDXRemote {...mdx} components={components} />
    );
}
