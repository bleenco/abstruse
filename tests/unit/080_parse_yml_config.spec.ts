import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { generateJobsAndEnv, Repository,
  Config, parseConfig, JobStage, CommandType } from '../../src/api/config';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Parsing YML Config', () => {
  it('Should parse YML config', () => {
    const yml = {
      image: 'abstruse',
      matrix: [ { env: 'NODE_VERSION=8' } ],
      preinstall:
      [ 'npm config set spin false',
        'npm config set progress false',
        'npm i' ],
      before_deploy:
      [ 'npm config set spin false',
        'echo before_deploy',
        'npm run-script test' ],
      script: [ 'npm run-script test' ],
      deploy:
      [ 'npm config set spin false',
        'echo deploying',
        'npm run script-test' ],
      install: [ 'nvm install $NODE_VERSION', 'npm install' ],
      cache: [ 'node_modules' ]
    };
    const parsed = parseConfig(yml);

    expect(parsed.image).to.equal('abstruse');
    expect(parsed.os).to.equal('linux');
    expect(parsed.stage).to.equal('test');
    expect(parsed.branches).to.equal(null);
    expect(parsed.env).to.equal(null);
    expect(parsed.install[0].type).to.equals('install');
    expect(parsed.install[1].command).to.equals('npm install');
    expect(parsed.deploy[0].command).to.equals('npm config set spin false');
  });

  it('Should parse YML config with allow failure', () => {
    const yml = {
      image: 'abstruse',
      matrix: [
        { env: 'NODE_VERSION=8' },
        { env: 'NODE_VERSION=9, TEST=1' },
        { allow_failures: [{ env: 'NODE_VERSION=9, TEST=1' }] },
      ],
      preinstall:
      [ 'npm config set spin false',
        'npm config set progress false',
        'npm i' ],
      before_deploy:
      [ 'npm config set spin false',
        'echo before_deploy',
        'npm run-script test' ],
      script: [ 'npm run-script test' ],
      deploy:
      [ 'npm config set spin false',
        'echo deploying',
        'npm run script-test' ],
      install: [ 'nvm install $NODE_VERSION', 'npm install' ],
      cache: [ 'node_modules' ]
    };
    const parsed = parseConfig(yml);

    expect(parsed.matrix.include.length).to.equal(2);
    expect(parsed.matrix.allow_failures).to.deep.equal([{ env: 'NODE_VERSION=9, TEST=1' }]);
    expect(parsed.image).to.equal('abstruse');
    expect(parsed.os).to.equal('linux');
    expect(parsed.stage).to.equal('test');
    expect(parsed.branches).to.equal(null);
    expect(parsed.env).to.equal(null);
    expect(parsed.install[0].type).to.equals('install');
    expect(parsed.install[1].command).to.equals('npm install');
    expect(parsed.deploy[0].command).to.equals('npm config set spin false');
  });

  it(`Generate Build with midex order of deployment commands`, () => {
    const repository: Repository = {
      clone_url: 'https://github.com/Izak88/d3-bundle.git',
      branch: 'master',
      pr: null,
      sha: 'be39d3cacf1f337877c1660696d21367af25983b',
      access_token: null,
      type: 'github',
      file_tree:
       [ '.abstruse.yml',
         '.git',
         '.gitignore',
         '.npmignore',
         'API.md',
         'CHANGES.md',
         'ISSUE_TEMPLATE.md',
         'LICENSE',
         'README.md',
         'd3.sublime-project',
         'img',
         'index.js',
         'jenkinsfile',
         'package.json',
         'rollup.config.js',
         'rollup.node.js',
         'test' ]
    };
    const config: Config = {
      image: 'abstruse',
      os: 'linux',
      stage: JobStage.test,
      cache: [ 'node_modules' ],
      branches: null,
      env: null,
      before_install: [],
      install:
      [ { command: 'nvm install $NODE_VERSION', type: CommandType.install },
        { command: 'npm install', type: CommandType.install } ],
      before_script: [],
      script: [ { command: 'npm run-script test', type: CommandType.script } ],
      before_cache: [],
      after_success: [],
      after_failure: [],
      before_deploy:
      [ { command: 'npm config set spin false', type: CommandType.before_deploy },
        { command: 'echo before_deploy', type: CommandType.before_deploy },
        { command: 'npm run-script test', type: CommandType.before_deploy } ],
      deploy:
      [ { command: 'npm config set spin false', type: CommandType.deploy },
        { command: 'echo deploying', type: CommandType.deploy },
        { command: 'npm run script-test', type: CommandType.deploy } ],
      after_deploy: [],
      after_script: [],
      jobs: { include: [], exclude: [] },
      matrix: { include: [ { env: 'NODE_VERSION=8' } ], exclude: [], allow_failures: [] }
    };

    const commands = generateJobsAndEnv(repository, config);

    expect(commands.length).to.equal(2);
    expect(commands[0].stage).to.equals('test');
    expect(commands[1].stage).to.equals('deploy');
  });

  it(`Generate Build with no deployment commands`, () => {
    const repository: Repository = {
      clone_url: 'https://github.com/Izak88/d3-bundle.git',
      branch: 'master',
      pr: null,
      sha: 'be39d3cacf1f337877c1660696d21367af25983b',
      access_token: null,
      type: 'github',
      file_tree:
       [ '.abstruse.yml',
         '.git',
         '.gitignore',
         '.npmignore',
         'API.md',
         'CHANGES.md',
         'ISSUE_TEMPLATE.md',
         'LICENSE',
         'README.md',
         'd3.sublime-project',
         'img',
         'index.js',
         'jenkinsfile',
         'package.json',
         'rollup.config.js',
         'rollup.node.js',
         'test' ]
    };
    const config: Config = {
      image: 'abstruse',
      os: 'linux',
      stage: JobStage.test,
      cache: [ 'node_modules' ],
      branches: null,
      env: null,
      before_install: [],
      install:
      [ { command: 'nvm install $NODE_VERSION', type: CommandType.install },
        { command: 'npm install', type: CommandType.install } ],
      before_script: [],
      script: [ { command: 'npm run-script test', type: CommandType.script } ],
      before_cache: [],
      after_success: [],
      after_failure: [],
      before_deploy: [],
      deploy: [],
      after_deploy: [],
      after_script: [],
      jobs: { include: [], exclude: [] },
      matrix: { include: [ { env: 'NODE_VERSION=8' } ], exclude: [], allow_failures: [] }
    };

    const commands = generateJobsAndEnv(repository, config);
    expect(commands.length).to.equal(1);
    expect(commands[0].stage).to.equals('test');
  });

  it(`Generate Build with allow_failure jobs`, () => {
    const repository: Repository = {
      clone_url: 'https://github.com/Izak88/d3-bundle.git',
      branch: 'master',
      pr: null,
      sha: 'be39d3cacf1f337877c1660696d21367af25983b',
      access_token: null,
      type: 'github',
      file_tree:
       [ '.abstruse.yml',
         '.git',
         '.gitignore',
         '.npmignore',
         'API.md',
         'CHANGES.md',
         'ISSUE_TEMPLATE.md',
         'LICENSE',
         'README.md',
         'd3.sublime-project',
         'img',
         'index.js',
         'jenkinsfile',
         'package.json',
         'rollup.config.js',
         'rollup.node.js',
         'test' ]
    };
    const config: Config = {
      image: 'abstruse',
      os: 'linux',
      stage: JobStage.test,
      cache: [ 'node_modules' ],
      branches: null,
      env: null,
      before_install: [],
      install:
      [ { command: 'nvm install $NODE_VERSION', type: CommandType.install },
        { command: 'npm install', type: CommandType.install } ],
      before_script: [],
      script: [ { command: 'npm run-script test', type: CommandType.script } ],
      before_cache: [],
      after_success: [],
      after_failure: [],
      before_deploy:
      [ { command: 'npm config set spin false', type: CommandType.before_deploy },
        { command: 'echo before_deploy', type: CommandType.before_deploy },
        { command: 'npm run-script test', type: CommandType.before_deploy } ],
      deploy:
      [ { command: 'npm config set spin false', type: CommandType.deploy },
        { command: 'echo deploying', type: CommandType.deploy },
        { command: 'npm run script-test', type: CommandType.deploy } ],
      after_deploy: [],
      after_script: [],
      jobs: { include: [], exclude: [] },
      matrix: {
        include: [ { env: 'NODE_VERSION=8' }, { env: 'NODE_VERSION=9, TEST=1' } ],
        exclude: [],
        allow_failures: [{ env: 'NODE_VERSION=9, TEST=1' }]
      }
    };

    const commands = generateJobsAndEnv(repository, config);

    expect(commands.length).to.equal(3);
    expect(commands[0].stage).to.equals('test');
    expect(commands[0].allow_failure).to.equals(false);
    expect(commands[1].stage).to.equals('test');
    expect(commands[1].allow_failure).to.equals(true);
    expect(commands[2].stage).to.equals('deploy');
    expect(commands[2].allow_failure).to.equals(false);
  });
});
