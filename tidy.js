#!/usr/bin/env node

const Metalsmith = require('metalsmith');
const tidy = require('metalsmith-html-tidy');

Metalsmith(__dirname)
    .source('./_reference')
    .destination('./_reference_test')
    .use(tidy({
            pattern: '**/*.html',
            tidyOptions: {
                'doctype': 'html5',
                'indent': true,
                'new-inline-tags': 'fb:fan',
                'output-html': true,
                'preserve-entities': true,
                'tidy-mark': false,
                'vertical-space': false,
            }
        }))
        .build((err) => {
            if (err) throw err;
        });
