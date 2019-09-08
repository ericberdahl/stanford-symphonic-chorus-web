const defaults = require('defaults');
const path = require('path');
const yaml = require('node-yaml');

function makeLookupHelper(dataPath)
{
    const debug = require('debug')('ssc-helpers:makeLookupHelper');

    debug('making lookup helper for %s', dataPath);

    const data = yaml.readSync(dataPath);
    const leaf = path.basename(dataPath);

    return (key) => {
        const result = data[key];
        debug('%s[%s] = %s', leaf, key, result);
        return result;
    };
}

function getYearOfProgram(program) {
    return program.first_concert.start.getFullYear();
}

function registerHelpers(options)
{
    if (!options.metalsmith)
    {
        throw "metalsmith option must be specified"
    }
    if (!options.handlebars)
    {
        throw "handlebars option must be specified"
    }

    options = defaults(options, {
        namespace: 'ssc-'
    });

    const Handlebars = options.handlebars;
    const metalsmith = options.metalsmith;

    Handlebars.registerHelper(options.namespace + 'getYearOfProgram', getYearOfProgram);

    Handlebars.registerHelper(options.namespace + 'findCollaborator',
                              makeLookupHelper(path.join(metalsmith.directory(), '_data', 'collaborators.yml')));

    Handlebars.registerHelper(options.namespace + 'findLightboxStyle',
                              makeLookupHelper(path.join(metalsmith.directory(), '_data', 'lightbox-style.yml')));

    Handlebars.registerHelper(options.namespace + 'findLocation',
                              makeLookupHelper(path.join(metalsmith.directory(), '_data', 'locations.yml')));

    Handlebars.registerHelper(options.namespace + 'findPerson',
                              makeLookupHelper(path.join(metalsmith.directory(), '_data', 'people.yml')));

    Handlebars.registerHelper(options.namespace + 'findPiece',
                              makeLookupHelper(path.join(metalsmith.directory(), '_data', 'pieces.yml')));
}

module.exports = {
    register: registerHelpers
};
