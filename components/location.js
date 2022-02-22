import getConfig from 'next/config'

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export default function Location({ name }) {
    const entry = publicRuntimeConfig.locations[name];
    if (!entry) {
        console.warn(`Unknown Location name "${name}"`);
        return (<></>);
    }

    return (entry.link ? 
            <a href={entry.link}>{entry.casual}</a> :
            <span>{entry.casual}</span>
    );
}
