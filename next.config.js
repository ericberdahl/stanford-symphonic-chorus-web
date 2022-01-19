const { PHASE_PRODUCTION_BUILD } = require('next/constants');

// TODO : move roles data from components/person.js into serverRuntimeConfig
// TODO : move location data from components/location.js into serverRuntimeConfig

module.exports = (phase, { defaultConfig }) => {
    const config = {
        serverRuntimeConfig: {
            isExport: (PHASE_PRODUCTION_BUILD == phase),
        }
    };

    if (config.serverRuntimeConfig.isExport) {
        config.basePath = '/group/SymCh';
    }

    return config;
}
