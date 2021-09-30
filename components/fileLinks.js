import SpaceSeparatedPhrase from './spaceSeparatedPhrase';

export default function FileLinks({ files }) {
    return (
        <SpaceSeparatedPhrase separator=' | '>
            {files.map((f, index) => <a key={index} href={f.route}>{f.variant}</a>)}
        </SpaceSeparatedPhrase>
    );
}
