const _ = require('lodash');
const debug = require('debug')('lodash-helpers');
const error = require('debug')('lodash-helpers:<error>*');

function wrapLodashFunction(func)
{
    return (handlebars, ...rest) => {
        const debug = require('debug')('lodash-helpers:' + func);

        const options = _.last(rest);
        const args = _.initial(rest);

        const result = _[func](...args);
        debug('calling %s(%o), result=%o, options=%o', func, args, result, options);
        return result;
    }
}

const helpers = {
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

    get: (handlebars, object, path, defaultValue, options) => {
        if (_.isUndefined(options)) {
            options = defaultValue;
            defaultValue = undefined;
        }

        return _.get(object, path, defaultValue);
    },
    
    partial: (handlebars, func, ...rest) => {
        // extract the 'options' argument to the helper and the variable arguments
        const options = _.last(rest);
        const args = _.slice(rest, 0, -1);

        debug('creating partial for %s with arguments %o', func, args);
        if (_.isString(func)) func = handlebars.helpers[func];
        if (!func) error('function not defined');
        return _.partial(func, ...args);
    },

    round: (handlebars, number, precision, options) => {
        if (_.isUndefined(options)) {
            options = precision;
            precision = undefined;
        }
        return _.round(number, precision);
    },

    set: (handlebars, object, path, value, options) => {
        _.set(object, path, value);
    }
}

// create simple lodash wrappers
_.forEach(['chunk',
            'defaultTo',
            'divide',
            'eq',
            'first',
            'groupBy',
            'join',
            'kebabCase',
            'last',
            'multiply',
            'trim',
            'upperCase'],

          (func) => {
                if (helpers[func]) {
                    error('%s cannot be wrapped because it is already defined', func);
                }
                helpers[func] = wrapLodashFunction(func);
          });

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
