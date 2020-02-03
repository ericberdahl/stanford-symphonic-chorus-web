#!/usr/bin/env node

/*
 TODO:
 - move /group/SymCh into data configuration
 */
const _ = require('lodash');
const logs = require('./lib/logs').forFilename(__filename);

const buildDir = './_build';

function showProgress(...args) {
    return (files, metalsmith, done) => {
        logs.info(...args);
        done();
    }
}

function buildSite(options)
{
    const applyPrefix = !options.serve;

    const Metalsmith = require('metalsmith');
    const blc = require('metalsmith-broken-link-checker');
    const browserSync = require('metalsmith-browser-sync');
    const createCurrentEvents = require('./lib/create-current-events');
    const debug = require('metalsmith-debug-ui');
    const discoverPartials = require('metalsmith-discover-partials');
    const fylp = require('./lib/fylp');
    const Handlebars = require('handlebars');
    const helpers = require('./lib/handlebars-helpers');
    const inplace = require('metalsmith-in-place');
    const layouts = require('handlebars-layouts');
    const linkcheck = require('metalsmith-linkcheck');
    const lodashHelpers = require('./lib/lodash-helpers');
    const performances = require('./lib/performances');
    const repertoire = require('./lib/repertoire');
    const prefix = require('metalsmith-prefixoid');
    const sanityCheckDates = require('./lib/sanity-check-dates');
    const ssc_helpers = require('./lib/ssc-helpers');
    const tidy = require('metalsmith-html-tidy');

    let metalsmith = Metalsmith(__dirname);
    
    //
    // Register Handlebars helper functions
    //
    layouts.register(Handlebars);
    lodashHelpers.register({
        handlebars: Handlebars
    });
    ssc_helpers.register({
        handlebars: Handlebars,
        metalsmith: metalsmith
    });

    helpers.defaultTimezone('America/Los_Angeles');
    helpers.register({
        handlebars: Handlebars,
        namespace: 'x-'
    });

    if (options.debug) {
        debug.patch(metalsmith);
    }

    metalsmith = metalsmith.use(showProgress('# Starting'))
        .source('./source')
        .destination(buildDir);

    metalsmith = metalsmith.use(showProgress('# Cleaning previous build'))
        .clean(true);

    metalsmith.use(showProgress('# Finding Handlebars partials'))
        .use(discoverPartials({
            directory: 'partials',
        }));

    metalsmith = metalsmith.use(showProgress('# Adding paths to each object'))
        .use((files, metalsmith, done) => {
            _.forEach(files, (fileObject, filename) => {
                fileObject.path = filename;
            });
            done();
        });

    metalsmith = metalsmith.use(showProgress('# Processing FYLP'))
        .use(fylp());

    metalsmith = metalsmith.use(showProgress('# Processing Peformances'))
        .use(performances());

    metalsmith = metalsmith.use(showProgress('# Sanity checking dates'))
        .use(sanityCheckDates());

    metalsmith = metalsmith.use(showProgress('# Creating current event list'))
        .use(createCurrentEvents());

    metalsmith = metalsmith.use(showProgress('# Creating repertoire'))
        .use(repertoire());

    metalsmith = metalsmith.use(showProgress('# Processing less stylesheets'))
        .use(inplace({
            pattern: '**/*.less',
        }));

    metalsmith = metalsmith.use(showProgress('# Processing Handlebars templates'))
        .use(inplace({
            pattern: '**/*.hbs',
        }));

    if (applyPrefix) {
        // Prefixing is only needed for actual deployment and messes with the
        // local server.
        metalsmith = metalsmith.use(showProgress('# Adding basePath prefix'))
            .use(prefix([
                { prefix: options.basePath, tag: 'a', attr: 'href' },
                { prefix: options.basePath, tag: 'area', attr: 'href' },
                { prefix: options.basePath, tag: 'img', attr: 'src' },
                { prefix: options.basePath, tag: 'link', attr: 'href' },
                { prefix: options.basePath, tag: 'script', attr: 'src' },
            ]));
    }

    if (options.tidy) {
        metalsmith = metalsmith.use(showProgress('# Tidying HTML'))
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

    if (options.serve) {
        metalsmith = metalsmith.use(showProgress('# Starting local server'))
            .use(browserSync({
                server: buildDir,
                files: [ "source/**/*", "partials/**/*", "data/**/*" ],
            }))
    }

    const blcOptions = {};
    if (applyPrefix) {
        blcOptions.baseUrl = options.basePath;
    }
    //metalsmith = metalsmith.use(blc(blcOptions));
    //metalsmith = metalsmith.use(linkcheck());

    metalsmith.build((err) => {
            if (err) throw err;
        });
}

const program = require('commander');

program.version('0.1.0', '-v, --version')
    .option('--debug', 'Build debug-ui into the output')
    .option('--no-tidy', 'Do not tidy the html output')
    .option('--serve', 'Build and launch as local server')
    .option('--basePath <path>', 'Specify base path from which the site will be served', '/group/SymCh')
    .parse(process.argv);

buildSite(program);