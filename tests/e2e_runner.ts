import { blue, bold, green, red, yellow, white } from 'chalk';
import * as glob from 'glob';
import * as path from 'path';
import * as minimist from 'minimist';
import { abstruse, killAllProcesses } from './e2e/utils/process';
import { killAllDockerContainers } from './e2e/utils/utils';

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
let allSetups = glob.sync(path.join(e2eRoot, 'setup/**/*.ts'), { nodir: true })
  .map(name => path.relative(e2eRoot, name))
  .sort();

let allTests = glob.sync(path.join(e2eRoot, testGlob), { nodir: true, ignore: argv.ignore })
  .map(name => path.relative(e2eRoot, name))
  .sort();

if (argv['nolink']) {
  allSetups = allSetups.filter(name => !name.includes('link.ts'));
}

if (argv['nobuild']) {
  allSetups = allSetups.filter(name => !name.includes('build.ts'));
}

const testsToRun = allSetups
  .concat(allTests
    .filter(name => {
      // Check for naming tests on command line.
      if (argv._.length == 0) {
        return true;
      }

      return argv._.some(argName => {
        return path.join(process.cwd(), argName) == path.join(__dirname, 'e2e', name)
          || argName == name
          || argName == name.replace(/\.ts$/, '');
      });
    }));

if (testsToRun.length == allTests.length) {
  console.log(`Running ${testsToRun.length} tests`);
} else {
  console.log(`Running ${testsToRun.length} tests (${allTests.length + allSetups.length} total)`);
}



testsToRun.reduce((previous, relativeName) => {
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
      .then(() => allSetups.indexOf(relativeName) === -1 ? abstruse() : Promise.resolve(null))
      .then(() => previousDir = process.cwd())
      .then(() => fn())
      .then(() => console.log('----'))
      .then(() => killAllProcesses())
      .then(() => killAllDockerContainers())
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
  .then(() => {
    console.log(green('Done.'));
    process.exit(0);
  }, err => {
    console.log('\n');
    console.error(red(`Test "${currentFileName}" failed...`));

    if (argv.debug) {
      console.log(`Current directory: ${process.cwd()}`);
      console.log('Will loop forever while you debug... CTRL-C to quit.');

      while (1) {
        // That's right!
      }
    }

    process.exit(1);
  });

function encode(str) {
  return str.replace(/[^A-Za-z\d\/]+/g, '-').replace(/\//g, '.').replace(/[\/-]$/, '');
}

function printHeader(testName) {
  const text = `${++index} of ${testsToRun.length}`;
  console.log(green(`Running "${bold(blue(testName))}" (${bold(white(text))})...`));
}

function printFooter(testName, startTime) {
  const t = Math.round((Date.now() - startTime) / 10) / 100;
  console.log(green('Last step took ') + bold(blue(`${t}`)) + green('s...'));
  console.log('');
}
