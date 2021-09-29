import CommaSeparatedList from '../components/commaSeparatedList'
import SpaceSeparatedPhrase from '../components/spaceSeparatedPhrase'

function EmTag({ children }) {
    return (<em>{children}</em>);
};

function NoTag ({ children }) {
    return (<>{children}</>)
};

function isEmpty(str) {
    return (!str || 0 == str.length);
}

export default function PieceCitation({ tag, data }) {
    tag = (tag ? tag : 'em');

    const Tag = ('em' == tag ? EmTag : NoTag);

    const Movement = ({ data }) => {
        return (!isEmpty(data.movement) ? 
            <SpaceSeparatedPhrase>
                <Tag>{data.movement}</Tag>
                from
            </SpaceSeparatedPhrase>
            : null);
    }

    const Titles = ({ titles }) => {
        if (!Array.isArray(titles)) {
            titles = [titles];
        }
        return (<CommaSeparatedList>{titles.map((t, index) => <Tag key={index}>{t}</Tag>)}</CommaSeparatedList>);
    }

    return (
        <span>
            <SpaceSeparatedPhrase>
                {!isEmpty(data.composer.fullName) ? data.composer.fullName : null}
                <SpaceSeparatedPhrase separator=', '>
                    <SpaceSeparatedPhrase>
                        {!isEmpty(data.prefix) ? data.prefix : null}
                        <Movement data={data}/>
                        <Titles titles={data.title}/>
                        {!isEmpty(data.translation) ? '(' + data.translation + ')' : null}
                        {!isEmpty(data.commonTitle) ? '"' + data.commonTitle + '"' : null}
                    </SpaceSeparatedPhrase>
                    {!isEmpty(data.catalog) ? data.catalog : null}
                    {!isEmpty(data.arranger) ? 'arranged by ' + data.arranger : null}
                </SpaceSeparatedPhrase>
                {!isEmpty(data.suffix) ? data.suffix : null}
            </SpaceSeparatedPhrase>
        </span>
    );
}
