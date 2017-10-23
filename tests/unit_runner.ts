import * as Mocha from 'mocha';
import * as glob from 'glob';
import * as path from 'path';
import * as minimist from 'minimist';
import { execSilent } from './e2e/utils/process';

const argv = minimist(process.argv.slice(2), {
  boolean: ['debug', 'verbose', 'nolink', 'nobuild'],
  string: ['glob', 'ignore']
});

const specFiles = glob.sync(path.resolve(__dirname, './unit/**/*.spec.*'));
const mo = new Mocha({ timeout: 180000, reporter: 'spec' });

Promise.resolve()
  .then((): any => {
    if (argv['nobuild']) {
      return Promise.resolve();
    } else {
      return execSilent('npm',  ['run', 'build:prod']);
    }
  })
  .then((): any => {
    if (argv['nolink']) {
      return Promise.resolve();
    } else {
      return execSilent('npm', ['link']);
    }
  })
  .then(() => {
    specFiles.forEach(file => mo.addFile(file));

    mo.run(failures => {
      process.on('exit', () => process.exit(failures));
    });
  });
