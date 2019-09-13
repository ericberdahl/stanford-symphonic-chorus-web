const _ = require('lodash');
const debug = require('debug')('lodash-helpers');
const error = require('debug')('lodash-helpers:<error>');

const helpers = {
    get: (handlebars, object, path, options) => {
        return _.get(object, path);
    },

    forEach: (handlebars, context, options) => {
        let result ='';
        
        let index = 0;
        _.forEach(context, (value, key, collection) => {
            let data = options.data;
            if (data)
            {
                data = handlebars.createFrame(data);
            }

            if (data)
            {
                data.key = key;
                data.index = index;
                data.first = (0 == data.index);
                data.last = (1 == _.size(collection) - data.index);
            }
            result += options.fn(value, { data: data });
            ++index;
        });

        return result;
    },

    forEachRight: (handlebars, context, options) => {
        let result ='';
        
        let index = 0;
        _.forEachRight(context, (value, key, collection) => {
            let data = options.data;
            if (data)
            {
                data = handlebars.createFrame(data);
            }

            if (data)
            {
                data.key = key;
                data.index = index;
                data.first = (0 == data.index);
                data.last = (1 == _.size(collection) - data.index);
            }
            result += options.fn(value, { data: data });
            ++index;
        });

        return result;
    },
    
    kebabCase: (handlebars, s, options) => { return _.kebabCase(s); },

    partial: (handlebars, func, ...rest) => {
        // extract the 'options' argument to the helper and the variable arguments
        const options = _.last(rest);
        const args = _.slice(rest, 0, -1);

        debug('creating partial for %s with arguments %o', func, args);
        if (_.isString(func)) func = handlebars.helpers[func];
        if (!func) error('function not defined');
        return _.partial(func, ...args);
    },

    round: (handlebars, number, options) => { return _.round(number); },
}

function registerHelpers(options)
{
    if (!options.handlebars)
    {
        throw "handlebars option must be specified"
    }

    options = _.assign({
        namespace: '_'
    }, options);

    _.forEach(helpers, (value, key) => {
        const helperName = options.namespace + key;
        debug('registering %s', helperName);
        options.handlebars.registerHelper(options.namespace + key, _.partial(value, options.handlebars));
    });
}

module.exports = {
    register: registerHelpers,
    helpers: helpers
};
