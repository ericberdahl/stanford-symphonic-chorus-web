#!/usr/bin/env npx ts-node-script

/*
 TODO:
 - move /group/SymCh into data configuration
 */

// Dependent libraries
import { program } from 'commander';
import * as _ from 'lodash';
import * as Metalsmith from 'metalsmith';

// Local libraries
import { Logs } from './lib/logs';

const logs = new Logs(__filename);

const buildDir = './_build';

function showProgress(formatter: any, ...args: any[])  : Metalsmith.Plugin {
    return (files, metalsmith, done) => {
        logs.info(formatter, ...args);
        done(null, files, metalsmith);
    }
}

function registerHelpers(metalsmith : Metalsmith, handlebars) : Metalsmith
{
    const helpers = require('./lib/handlebars-helpers');
    const layouts = require('handlebars-layouts');
    const lodashHelpers = require('./lib/lodash-helpers');
    const ssc_helpers = require('./lib/ssc-helpers');

    //
    // Register Handlebars helper functions
    //
    layouts.register(handlebars);
    lodashHelpers.register({
        handlebars: handlebars
    });
    ssc_helpers.register({
        handlebars: handlebars,
        metalsmith: metalsmith
    });

    helpers.defaultTimezone('America/Los_Angeles');
    helpers.register({
        handlebars: handlebars,
        namespace: 'x-'
    });

    return metalsmith;
}

function initializeBuild(metalsmith : Metalsmith) : Metalsmith
{
    const discoverPartials = require('metalsmith-discover-partials');

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
            done(null, files, metalsmith);
        });

    return metalsmith;
}

function setupProgramMetadata(metalsmith : Metalsmith) : Metalsmith
{
    const createCurrentEvents = require('./lib/create-current-events');
    const fylp = require('./lib/fylp');
    const performances = require('./lib/performances');
    const repertoire = require('./lib/repertoire');
    const sanityCheckDates = require('./lib/sanity-check-dates');

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

    return metalsmith;
}

function processStylesheets(metalsmith : Metalsmith) : Metalsmith
{
    const inplace = require('metalsmith-in-place');

    metalsmith = metalsmith.use(showProgress('# Processing less stylesheets'))
        .use(inplace({
            pattern: '**/*.less',
            engineOptions: {
                paths: [
                    './less/',
                    './source/css/'
                ]
            }
        }));

    return metalsmith;
}

function processHandlebars(metalsmith : Metalsmith) : Metalsmith
{
    const inplace = require('metalsmith-in-place');

    metalsmith = metalsmith.use(showProgress('# Processing Handlebars templates'))
        .use(inplace({
            pattern: '**/*.hbs',
        }));

    return metalsmith;
}

function applyPrefixes(metalsmith : Metalsmith, basePath) : Metalsmith
{
    const prefix = require('metalsmith-prefixoid');

    // Prefixing is only needed for actual deployment and messes with the
    // local server.
    metalsmith = metalsmith.use(showProgress('# Adding basePath prefix'))
        .use(prefix([
            { prefix: basePath, tag: 'a', attr: 'href' },
            { prefix: basePath, tag: 'area', attr: 'href' },
            { prefix: basePath, tag: 'img', attr: 'src' },
            { prefix: basePath, tag: 'link', attr: 'href' },
            { prefix: basePath, tag: 'script', attr: 'src' },
        ]));

    return metalsmith;
}

function tidyOutput(metalsmith : Metalsmith) : Metalsmith
{
    const tidy = require('metalsmith-html-tidy');

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

    return metalsmith;
}

function serveOutputLocally(metalsmith : Metalsmith, port: Number) : Metalsmith
{
    const browserSync = require('metalsmith-browser-sync');

    metalsmith = metalsmith.use(showProgress('# Starting local server'))
        .use(browserSync({
            server: buildDir,
            port: port,
            files: [ "source/**/*", "partials/**/*", "data/**/*" ],
        }));

    return metalsmith;
}

function performBrokenLinkChecks(metalsmith : Metalsmith, baseUrl) : Metalsmith
{
    const blc = require('metalsmith-broken-link-checker');

    interface BlcOptions {
        baseUrl?: string;
    }

    const blcOptions : BlcOptions = {};
    if (baseUrl) {
        blcOptions.baseUrl = baseUrl;
    }
    metalsmith = metalsmith.use(blc(blcOptions));

    return metalsmith;
}

function buildSite(options)
{
    const applyPrefix = !options.serve;

    const debug = require('metalsmith-debug-ui');
    const Handlebars = require('handlebars');

    let metalsmith : Metalsmith = Metalsmith(__dirname);
    
    metalsmith = registerHelpers(metalsmith, Handlebars);

    if (options.debug) {
        debug.patch(metalsmith);
    }

    metalsmith = initializeBuild(metalsmith);
    metalsmith = setupProgramMetadata(metalsmith);
    metalsmith = processStylesheets(metalsmith);
    metalsmith = processHandlebars(metalsmith);

    if (applyPrefix) {
        // Prefixing is only needed for actual deployment and messes with the
        // local server.
        metalsmith = applyPrefixes(metalsmith, options.basePath);
    }

    if (options.tidy) {
        metalsmith = tidyOutput(metalsmith);
    }

    if (options.serve) {
        const port = (true === options.serve ? 3000 : options.serve);
        metalsmith = serveOutputLocally(metalsmith, port);
    }

    if (false) {
        metalsmith = performBrokenLinkChecks(metalsmith, applyPrefix ? options.basePath : null);
    }

    metalsmith.build((err) => {
            if (err) throw err;
        });
}

program.version('0.1.0', '-v, --version')
    .option('--debug', 'Build debug-ui into the output')
    .option('--no-tidy', 'Do not tidy the html output')
    .option('--serve [port]', 'Build and launch as local server, listening on the specified port')
    .option('--basePath <path>', 'Specify base path from which the site will be served', '/group/SymCh')
    .parse(process.argv);

buildSite(program);