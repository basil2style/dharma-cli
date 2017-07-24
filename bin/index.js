#!/usr/bin/env node
require("babel-polyfill");
const CLI = require('../src/CLI.js');
CLI.entry(process.argv);
