#!/usr/bin/env node

/*
 TODO:
 - move /group/SymCh into data configuration
 */
const debug = require('debug');
const info = debug('build-ssc');

debug.enable('build-ssc');
info.log = console.info.bind(console);

function showProgress() {
    return (files, metalsmith, done) => {
        info.apply(info, arguments);
        done();
    }
}

function sortFylpLinks(files, metalsmith, done) {
    const metadata = metalsmith.metadata();
    const performances = metadata.collections.performances;

    performances.forEach((program) => {
        program.references.fylp.sort((a, b) => {
            const pieceFinder = (pieceRef) => {
                return (piece) => {
                    return pieceRef == piece.ref;
                }
            }

            const aIndex = program.repertoire.findIndex((piece) => {
                return (a.piece_ref == piece.ref);
            });
            const bIndex = program.repertoire.findIndex((piece) => {
                return (b.piece_ref == piece.ref);
            });
            if (aIndex == bIndex) return 0;
            return (aIndex < bIndex ? -1 : 1);
        });
    });

    done();
}

function findCurrentProgram(options)
{
    return (files, metalsmith, done) => {
        const metadata = metalsmith.metadata();
        const performances = metadata.collections.performances;

        metadata.currentProgram = performances.slice().reverse().find((value, index, array) => {
            return !value.isFuture;
        });

        done();
    };
}

function buildSite(options)
{
    const applyPrefix = !options.serve;

    const Metalsmith = require('metalsmith');
    const blc = require('metalsmith-broken-link-checker');
    const browserSync = require('metalsmith-browser-sync');
    const collections = require('metalsmith-collections');
    const debug = require('metalsmith-debug-ui');
    const dashbars = require('dashbars');
    const discoverPartials = require('metalsmith-discover-partials');
    const Handlebars = require('handlebars');
    const helpers = require('handlebars-helpers');
    const inplace = require('metalsmith-in-place');
    const layouts = require('handlebars-layouts');
    const linkcheck = require('metalsmith-linkcheck');
    const metadata = require('./lib/metadata');
    const prefix = require('metalsmith-prefixoid');
    const references = require('./lib/collection-references');
    const tidy = require('metalsmith-html-tidy');

    // string helpers must be registered before array helpers is
    // because reverse is defined in both places, and array's
    // version is correct for strings, but not vice-versa.
    helpers.string({ handlebars: Handlebars });
    helpers.array({ handlebars: Handlebars });
    helpers.comparison({ handlebars: Handlebars });
    helpers.html({ handlebars: Handlebars });
    helpers.math({ handlebars: Handlebars });
    helpers.path({ handlebars: Handlebars });
    
    dashbars.help(Handlebars);

    layouts.register(Handlebars);

    Handlebars.registerHelper('ssc-getYearOfProgram', (program) => {
        return new Date(program.first_concert.start).getFullYear();
    });

    let metalsmith = Metalsmith(__dirname);

    if (options.debug) {
        debug.patch(metalsmith);
    }

    metalsmith = metalsmith.use(showProgress('# Starting'))
        .source('./source')
        .destination('./build');

    metalsmith = metalsmith.use(showProgress('# Cleaning previous build'))
        .clean(true)
        .use(showProgress('# Finding Handlebars partials'))
        .use(discoverPartials({
            directory: 'partials',
        }));
    
    metalsmith = metalsmith.use(showProgress('# Loading external metadata'))
        .use(metadata({
            directory: '_data',
            rootKey: '_data',
            pattern: '**/*.yml'
        }));

    metalsmith = metalsmith.use(showProgress('# Building collections'))
        .use(collections({
            performances: {
                pattern: 'performances/*/schedule.hbs',
                sortBy: (a, b) => {
                    if (a.first_concert.start == b.first_concert.start) {
                        return 0;
                    }
                    return (a.first_concert.start < b.first_concert.start ? -1 : 1);
                },
            },
            fylp: {
                pattern: 'fylp/*.hbs',
                sortBy: 'piece_ref'
            }
        }));

    metalsmith = metalsmith.use(showProgress('# Finding current program'))
        .use(findCurrentProgram());

    metalsmith = metalsmith.use(showProgress('# Creating cross-references'))
        .use(references({
            source: 'performances',
            destination: 'fylp',
            match: (src, dest) => {
                const found = src.repertoire.find((piece) => {
                    return (piece.ref == dest.piece_ref);
                });
                return found;
            },
        }))
        .use(sortFylpLinks);

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
                server: "build",
                files: [ "source/**/*", "partials/**/*", "_data/**/*" ],
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