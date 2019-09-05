const debug = require('debug')('data-lookup-helper');
const path = require('path');
const yaml = require('node-yaml');

function makeLookupHelper(dataPath)
{
    debug('making lookup helper for %s', dataPath);

    const data = yaml.readSync(dataPath);
    const leaf = path.basename(dataPath);

    return (key) => {
        const result = data[key];
        debug('%s[%s] = %s', leaf, key, result);
        return result;
    };
}

module.exports = makeLookupHelper;