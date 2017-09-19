#!/usr/bin/env node

const CommandLine = require('../lib/cli');
const cli = new CommandLine(process);
cli.execute();
