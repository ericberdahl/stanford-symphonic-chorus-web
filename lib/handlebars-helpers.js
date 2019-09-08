const defaults = require('defaults');

function sentence(context, options)
{
    const debug = require('debug')('handlebars-helpers:sentence');

    debug("joining sentence for %o", context);

    const renderings = context.map((item) => {
        return options.fn(item);
    });

    debug("renderings are %o", renderings);

    let result = renderings[0];
    if (renderings.length > 2)
    {
        result += ", ";
    }

    for (let i = 1; i < renderings.length - 1; ++i)
    {
        result += renderings[i] + ", ";
    }

    if (renderings.length > 1)
    {
        result += " and " + renderings[renderings.length - 1];
    }

    debug("result is %o", result);

    return result;
}

function registerHelpers(options)
{
    if (!options.handlebars)
    {
        throw "handlebars option must be specified"
    }

    options = defaults(options, {
        namespace: 'hlp-'
    });

    const Handlebars = options.handlebars;

    Handlebars.registerHelper(options.namespace + 'sentence', sentence);
}

module.exports = {
    register: registerHelpers
};
