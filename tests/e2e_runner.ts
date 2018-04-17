import * as glob from 'glob';
import * as path from 'path';
import * as minimist from 'minimist';
import { abstruse, killAllProcesses, execSilent } from './e2e/utils/process';
import { writeFileSync, readFileSync } from 'fs';
import * as temp from 'temp';
import chalk from 'chalk';

Error.stackTraceLimit = Infinity;

const argv = minimist(process.argv.slice(2), {
  boolean: ['debug', 'verbose', 'nolink', 'nobuild'],
  string: ['glob', 'ignore']
});

process.exitCode = 255;

const testGlob = 'tests/**/*.ts';
let currentFileName = null;
let index = 0;

const e2eRoot = path.join(__dirname, 'e2e');

let allTests = glob.sync(path.join(e2eRoot, testGlob), { nodir: true, ignore: argv.ignore })
  .map(name => path.relative(e2eRoot, name))
  .sort();

const testsToRun = allTests
  .filter(name => {
    // Check for naming tests on command line.
    if (argv._.length === 0) {
      return true;
    }

    return argv._.some(argName => {
      return path.join(process.cwd(), argName) === path.join(__dirname, 'e2e', name)
        || argName === name
        || argName === name.replace(/\.ts$/, '');
    });
  });

console.log(`Running ${testsToRun.length} tests`);

let tempTestsDir = null;

Promise.resolve()
  .then(() => process.chdir(path.join(__dirname, '..')))
  .then((): any => {
    if (!argv['nobuild']) {
      console.log(`\nBuilding abstruse ...`);
      return execSilent('npm',  ['run', 'build:prod']);
    } else {
      return Promise.resolve();
    }
  })
  .then((): any => {
    if (!argv['nolink']) {
      console.log(`\nLinking abstruse ...`);
      return execSilent('npm',  ['link']);
    } else {
      return Promise.resolve();
    }
  })
  .then(() => tempTestsDir = temp.mkdirSync('abstruse-e2e-tests'))
  .then(() => abstruse(tempTestsDir, argv['debug']))
  .then(() => {
    const configPath = path.join(tempTestsDir, 'abstruse', 'config.json');
    const config = JSON.parse(readFileSync(configPath).toString());
    const newConfig = Object.assign({}, config, { secret: 'thisIsSecret' });
    writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  })
  .then(() => {
    return testsToRun.reduce((previous, relativeName) => {
      let absoluteName = path.join(e2eRoot, relativeName);
      if (/^win/.test(process.platform)) {
        absoluteName = absoluteName.replace(/\\/g, path.posix.sep);
      }

      return previous.then(() => {
        currentFileName = relativeName.replace(/\.ts$/, '');
        const start = +new Date();

        const module = require(absoluteName);
        const fn: (...args: any[]) => Promise<any> | any =
          (typeof module === 'function') ? module
          : (typeof module.default === 'function') ? module.default
          : () => { throw new Error('Invalid test module.'); };

        let clean = true;
        let previousDir = null;
        return Promise.resolve()
          .then(() => printHeader(currentFileName))
          .then(() => previousDir = process.cwd())
          .then(() => fn())
          .then(() => console.log('----'))
          .then(() => printFooter(currentFileName, start), err => {
            printFooter(currentFileName, start);
            console.error(err);
            throw err;
          })
          .catch(err => killAllProcesses().then(() => {
            process.exit(process.exitCode);
          }));
      });
    }, Promise.resolve())
      .then(() => killAllProcesses())
      .then(() => {
        console.log(chalk.green('Done.'));
        process.exit(0);
      }, err => {
        killAllProcesses()
          .then(() => {
            console.log('\n');
            console.error(chalk.red(`Test "${currentFileName}" failed...`));
            process.exit(1);
          });
      });
  })
  .catch(err => {
    console.log(chalk.red(`Error: ${err}`));
    process.exit(process.exitCode);
  });

function encode(str) {
  return str.replace(/[^A-Za-z\d\/]+/g, '-').replace(/\//g, '.').replace(/[\/-]$/, '');
}

function printHeader(testName) {
  const text = `${++index} of ${testsToRun.length}`;
  const msg = [
    `Running "${chalk.bold(chalk.blue(testName))}" `,
    `(${chalk.bold(chalk.white(text))})...`
  ].join('');
  console.log(msg);
}

function printFooter(testName, startTime) {
  const t = Math.round((Date.now() - startTime) / 10) / 100;
  console.log(chalk.green('Last step took ') +
    chalk.bold(chalk.blue(`${t}`)) + chalk.green('s...'));
  console.log('');
}
