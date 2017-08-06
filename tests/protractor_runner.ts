import { execSilent, exec, abstruse, killAllProcesses } from './e2e/utils/process';
import { join } from 'path';
import * as temp from 'temp';
import * as minimist from 'minimist';
import { killAllContainers } from '../src/api/docker';

let tempRoot = null;
let exitCode = null;

const argv = minimist(process.argv.slice(2), {
  boolean: ['nolink', 'nobuild']
});

Promise.resolve()
  .then(() => process.chdir(join(__dirname, '../')))
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
    tempRoot = temp.mkdirSync('abstruse-e2e-protractor');
    console.log(`Using "${tempRoot}" as temporary directory for e2e protractor tests.`);
  })
  .then(() => abstruse(tempRoot))
  .then(() => exec('npm', ['run', 'protractor:ci']))
  .then(result => {
    exitCode = result.code;
    return killAllProcesses();
  })
  .then(() => killAllContainers())
  .then(() => process.exit(exitCode));
