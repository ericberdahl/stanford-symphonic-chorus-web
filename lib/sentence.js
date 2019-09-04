const debug = require('debug')('sentence');

function sentence(context, options)
{
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

module.exports = sentence;
