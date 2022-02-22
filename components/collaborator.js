import getConfig from 'next/config'

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export default function Collaborator({ name }) {
    const entry = publicRuntimeConfig.collaborators[name];
    if (!entry) {
        throw new Error(`Unknown Collaborator name "${name}"`);
    }

    return (entry.link ? 
            <a href={entry.link}>{entry.name}</a> :
            <span>{entry.name}</span>
    );
}
