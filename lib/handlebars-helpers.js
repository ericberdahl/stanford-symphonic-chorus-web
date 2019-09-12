const _ = require('lodash');

function sentence(context, options)
{
    const debug = require('debug')('handlebars-helpers:sentence');

    debug("joining sentence for %o", context);

    const renderings = context.map((item) => {
        return options.fn(item);
    });

    debug("renderings are %o", renderings);

    const result = (renderings.length < 3 ?
                            _.join(renderings, ' and ') :
                            _.join(_.dropRight(renderings), ', ') + ', and ' + _.last(renderings));

    debug("result is %o", result);

    return result;
}

function firstNonNull()
{
    return _.find(arguments, (value) => { return value != null; });
}

function reverse(array)
{
    return array.slice().reverse();
}

function sanitize(s)
{
    const sanitizeHtml = require('sanitize-html');
    return sanitizeHtml(s, {
        allowedTags: []
    });
}

function registerHelpers(options)
{
    if (!options.handlebars)
    {
        throw "handlebars option must be specified"
    }

    options = _.assign({
        namespace: 'hlp-'
    }, options);

    const Handlebars = options.handlebars;

    Handlebars.registerHelper(options.namespace + 'default', firstNonNull);
    Handlebars.registerHelper(options.namespace + 'reverse', reverse);
    Handlebars.registerHelper(options.namespace + 'sanitize', sanitize);
    Handlebars.registerHelper(options.namespace + 'sentence', sentence);
}

module.exports = {
    register: registerHelpers
};
