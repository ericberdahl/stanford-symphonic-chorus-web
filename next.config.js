const yaml = require('yaml');

const { PHASE_PRODUCTION_BUILD } = require('next/constants');

const fs        = require('fs');
const path      = require('path');
const process   = require('process');

const CONFIG_FILENAME   = path.join(process.cwd(), 'data', 'main.yml');

// TODO : move roles data from components/person.js into serverRuntimeConfig
// TODO : move location data from components/location.js into serverRuntimeConfig

module.exports = (phase, { defaultConfig }) => {
    const siteConfig = yaml.parse(fs.readFileSync(CONFIG_FILENAME, 'utf8'));

    const nextConfig = {
        serverRuntimeConfig: siteConfig,
    };

    nextConfig.serverRuntimeConfig.isExport = (PHASE_PRODUCTION_BUILD == phase);

    if (nextConfig.serverRuntimeConfig.isExport) {
        nextConfig.basePath = siteConfig.basePath;
    }

    return nextConfig;
}
