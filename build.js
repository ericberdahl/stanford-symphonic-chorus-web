#!/usr/bin/env node

const Metalsmith = require('metalsmith');

Metalsmith(__dirname)
    .source('./source')
    .destination('./build')
    .clean(true)
    .build((err) => {
        if (err) throw err;
    });
