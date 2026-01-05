import { MDXRemote } from 'next-mdx-remote'

function YouTube({ video }) {
    return (
        <iframe width="560" height="315"
                src={`https://www.youtube.com/embed/${video}`}
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
