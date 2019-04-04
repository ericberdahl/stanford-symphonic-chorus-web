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
const debug = require('metalsmith-debug-ui');
const discoverPartials = require('metalsmith-discover-partials');
const helpers = require('handlebars-helpers');
const inplace = require('metalsmith-in-place');
const metadata = require('./lib/metadata');
const prefix = require('metalsmith-prefixoid');
const tidy = require('metalsmith-html-tidy');

helpers();

const ms = Metalsmith(__dirname);

debug.patch(ms);

ms.source('./source')
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
    .use(inplace({
        pattern: '**/*.hbs',
    }))
    .use(prefix([
        { prefix: '/group/SymCh', tag: 'a', attr: 'href' },
        { prefix: '/group/SymCh', tag: 'area', attr: 'href' },
        { prefix: '/group/SymCh', tag: 'img', attr: 'src' },
        { prefix: '/group/SymCh', tag: 'link', attr: 'href' },
        { prefix: '/group/SymCh', tag: 'script', attr: 'src' },
    ]))
    .use(tidy({
        tidyOptions: {
            'doctype': 'html5',
            'indent': true,
            'new-inline-tags': 'fb:fan',
            'output-html': true,
            'preserve-entities': true,
            'vertical-space': false,
        }
    }))
    .build((err) => {
        if (err) throw err;
    });
