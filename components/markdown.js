import { MDXRemote } from 'next-mdx-remote'

function YouTube({ video }) {
    const srcURL = "https://www.youtube.com/embed/" + video;

    return (
        <iframe width="560" height="315"
                src={srcURL}
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen />
    );
}

export default function Markdown({ mdx }) {
    return (
        <MDXRemote {...mdx} />
    );
}
