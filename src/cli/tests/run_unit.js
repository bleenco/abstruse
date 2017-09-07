'use strict';

require('../../../tests/helpers/transpile');
const Mocha = require('mocha');
const glob = require('glob');
const path = require('path');

const specFiles = glob.sync(path.resolve(__dirname, './unit/**/*.spec.*'));
const mocha = new Mocha({ timeout: 5000, reporter: 'spec' });

specFiles.forEach(file => mocha.addFile(file));

mocha.run(failures => {
  process.on('exit', () => process.exit(failures));
});
