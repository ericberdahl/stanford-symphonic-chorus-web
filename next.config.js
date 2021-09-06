const { PHASE_PRODUCTION_BUILD } = require('next/constants')

module.exports = (phase, { defaultConfig }) => {
    const config = {
        serverRuntimeConfig: {
            isExport: (PHASE_PRODUCTION_BUILD == phase),
        }
    };

    return config;
}
