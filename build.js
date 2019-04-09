#!/usr/bin/env node

/*
 TODO:
 - metalsmith-broken-link-checker
 - metalsmith-paths
 - metalsmith-serve
 - metalsmith-collections
 - move /group/SymCh into data configuration
 */

const Metalsmith = require('metalsmith');
const collections = require('metalsmith-collections');
const debug = require('metalsmith-debug-ui');
const discoverPartials = require('metalsmith-discover-partials');
const Handlebars = require('handlebars');
const helpers = require('handlebars-helpers');
const inplace = require('metalsmith-in-place');
const metadata = require('./lib/metadata');
const path = require('path');
const prefix = require('metalsmith-prefixoid');
const serve = require('metalsmith-serve');
const tidy = require('metalsmith-html-tidy');

const options = {
    basePath: '/group/SymCh',
    tidy: true,
    serve: false,
}

helpers({
    handlebars: Handlebars
});

Handlebars.registerHelper('pathJoin', function() {
    const segments = Array.prototype.slice.call(arguments, 0, -1);
    return path.join.apply(path, segments);
});


Handlebars.registerHelper('arr', function() {
    // Return arguments as an array, ommiting the final (options) item
    return Array.prototype.slice.call(arguments, 0, -1);
});

Handlebars.registerHelper('concat', (first, second) => {
    return first.concat(second);
});

let metalsmith = Metalsmith(__dirname);

debug.patch(metalsmith);

metalsmith = metalsmith.source('./source')
    .destination('./build')
    .clean(true)
    .use(discoverPartials({
        directory: 'partials',
    }))
    .use(metadata({
        directory: '_data',
        rootKey: '_data',
        pattern: '**/*.yml'
    }))
    .use(collections())
    .use(inplace({
        pattern: '**/*.hbs',
    }));

if (options.serve) {
    metalsmith = metalsmith.use(serve());
}
else {
    metalsmith = metalsmith.use(prefix([
        { prefix: options.basePath, tag: 'a', attr: 'href' },
        { prefix: options.basePath, tag: 'area', attr: 'href' },
        { prefix: options.basePath, tag: 'img', attr: 'src' },
        { prefix: options.basePath, tag: 'link', attr: 'href' },
        { prefix: options.basePath, tag: 'script', attr: 'src' },
    ]))
    .use(tidy({
        tidyOptions: {
            'doctype': 'html5',
            'indent': true,
            'new-inline-tags': 'fb:fan',
            'output-html': true,
            'preserve-entities': true,
            'tidy-mark': false,
            'vertical-space': false,
        }
    }));
}

metalsmith.build((err) => {
        if (err) throw err;
    });
