const _ = require('lodash');
const debug = require('debug')('handlebars-helpers');
const moment = require('moment');
const path = require('path');

const helpers = {
    array: (handlebars, ...rest) => {
        const options = _.last(rest);
        return _.initial(rest);
    },

    'let': (handlebars, context, options) => {
        context = _.clone(context);
        _.assign(context, options.hash);
        return options.fn(context);
    },

    pluralize: (handlebars, singular, plural, selector, options) => {
        const size = (_.isNumber(selector) ? selector : _.size(selector));
        return (1 == size ? singular : plural);
    },

    sanitize: (handlebars, s, options) => {
        const sanitizeHtml = require('sanitize-html');
        return sanitizeHtml(s, {
            allowedTags: []
        });
    },

    sentence: (handlebars, context, options) => {
        debug("joining sentence for %o", context);

        const renderings = _.castArray(context).map((item) => {
            return options.fn(item);
        });

        debug("renderings are %o", renderings);

        const result = (renderings.length < 3 ?
                                _.join(renderings, ' and ') :
                                _.join(_.dropRight(renderings), ', ') + ', and ' + _.last(renderings));

        debug("result is %o", result);

        return result;
    },

    stringConcat: (handlebars, ...rest) => {
        const options = _.last(rest);
        const args = _.initial(rest);
        return args.join('');
    },
}

const fileHelpers = {
    dirname: (handlebars, pathname, options) => {
        return _.trimEnd(path.dirname(pathname), '/');
    },

    dropExtname: (handlebars, pathname, options) => {
        return path.join(path.dirname(pathname),
                         path.basename(pathname, path.extname(pathname)));
    },

    extname: (handlebars, pathname, options) => {
        return path.extname(pathname);
    },

    join: (handlebars, ...rest) => {
        const options = _.last(rest);
        const args = _.initial(rest);
        return path.join(...args);
    },
}

const dateHelpers = {
    formatDate: (handlebars, format, date, options) => {
        return moment(date).format(format);
    }
}

function registerHelpers(options)
{
    if (!options.handlebars)
    {
        throw "handlebars option must be specified"
    }

    options = _.assign({
        namespace: ''
    }, options);

    _.forEach(helpers, (value, key) => {
        const helperName = options.namespace + key;
        debug('registering %s', helperName);
        options.handlebars.registerHelper(options.namespace + key, _.partial(value, options.handlebars));
    });

    _.forEach(dateHelpers, (value, key) => {
        const helperName = options.namespace + key;
        debug('registering %s', helperName);
        options.handlebars.registerHelper(options.namespace + key, _.partial(value, options.handlebars));
    });

    _.forEach(fileHelpers, (value, key) => {
        const helperName = options.namespace + key;
        debug('registering %s', helperName);
        options.handlebars.registerHelper(options.namespace + key, _.partial(value, options.handlebars));
    });
}

module.exports = {
    register: registerHelpers,
    helpers: helpers
};
