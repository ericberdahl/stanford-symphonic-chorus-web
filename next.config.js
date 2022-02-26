const yaml = require('yaml');

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const fs        = require('fs');
const path      = require('path');
const process   = require('process');

const SERVERCONFIG_FILENAME   = path.join(process.cwd(), 'data', 'main.yml');

const COLLABORATORS_FILENAME   = path.join(process.cwd(), 'data', 'collaborators.yml');
const LOCATIONS_FILENAME       = path.join(process.cwd(), 'data', 'locations.yml');
const PEOPLE_FILENAME          = path.join(process.cwd(), 'data', 'people.yml');

module.exports = (phase, { defaultConfig }) => {

    const nextConfig = {
        serverRuntimeConfig: yaml.parse(fs.readFileSync(SERVERCONFIG_FILENAME, 'utf8')),
        publicRuntimeConfig: {
            collaborators:  yaml.parse(fs.readFileSync(COLLABORATORS_FILENAME, 'utf8')),
            locations:      yaml.parse(fs.readFileSync(LOCATIONS_FILENAME, 'utf8')),
            people:         yaml.parse(fs.readFileSync(PEOPLE_FILENAME, 'utf8')),
        }
    };

    nextConfig.serverRuntimeConfig.isExport = (PHASE_PRODUCTION_BUILD == phase);

    if (nextConfig.serverRuntimeConfig.isExport) {
        nextConfig.basePath = nextConfig.serverRuntimeConfig.basePath;
    }

    return nextConfig;
}
