import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { prepareCommands } from '../../src/api/utils';
import { CommandType } from '../../src/api/config';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Test preparing commands', () => {
  it(`filter and sort commands for git type`, () => {
    const process: any = {
      build_id: 502,
      job_id: 2123,
      status: 'queued',
      commands:
       [ { command: 'git clone https://github.com/Izak88/d3-bundle.git -b master .', type: 'git' },
         { command: 'git fetch origin master', type: 'git' },
         { command: 'git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5 .', type: 'git' },
         { command: 'nvm install $NODE_VERSION', type: 'install' },
         { command: 'npm install', type: 'install' },
         { command: 'npm run-script test', type: 'script' } ],
      cache: [ 'node_modules' ],
      repo_name: 'Izak88/d3-bundle',
      branch: 'master',
      env: [ 'NODE_VERSION=8' ],
      image_name: 'abstruse',
      exposed_ports: null,
      log: []
    };

    const types = [CommandType.git];
    let commands = prepareCommands(process, types);

    expect(commands[0].command).to.include('git clone https://github.com/Izak88/d3-bundle.');
    expect(commands[1].command).to.equals('git fetch origin master');
    expect(commands[2].command).to.include('git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5');
    expect(commands.length).to.equals(3);
  });

  it(`filter and sort commands for install and script`, () => {
    const process: any = {
      build_id: 502,
      job_id: 2123,
      status: 'queued',
      commands:
       [ { command: 'git clone https://github.com/Izak88/d3-bundle.git -b master .', type: 'git' },
         { command: 'git fetch origin master', type: 'git' },
         { command: 'git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5 .', type: 'git' },
         { command: 'nvm install $NODE_VERSION', type: 'install' },
         { command: 'npm install', type: 'install' },
         { command: 'npm run-script test', type: 'script' } ],
      cache: [ 'node_modules' ],
      repo_name: 'Izak88/d3-bundle',
      branch: 'master',
      env: [ 'NODE_VERSION=8' ],
      image_name: 'abstruse',
      exposed_ports: null,
      log: []
    };

    const types = [CommandType.install, CommandType.script];
    let commands = prepareCommands(process, types);

    expect(commands[0].command).to.equals('nvm install $NODE_VERSION');
    expect(commands[1].command).to.equals('npm install');
    expect(commands[2].command).to.equals('npm run-script test');
    expect(commands.length).to.equals(3);
  });

  it(`filter and sort commands for install and script`, () => {
    const process: any = {
      build_id: 502,
      job_id: 2123,
      status: 'queued',
      commands:
       [ { command: 'git clone https://github.com/Izak88/d3-bundle.git -b master .', type: 'git' },
         { command: 'git fetch origin master', type: 'git' },
         { command: 'npm run-script test', type: 'script' },
         { command: 'git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5 .', type: 'git' },
         { command: 'nvm install $NODE_VERSION', type: 'install' },
         { command: 'npm install', type: 'install' } ],
      cache: [ 'node_modules' ],
      repo_name: 'Izak88/d3-bundle',
      branch: 'master',
      env: [ 'NODE_VERSION=8' ],
      image_name: 'abstruse',
      exposed_ports: null,
      log: []
    };

    const types = [CommandType.install, CommandType.script];
    let commands = prepareCommands(process, types);

    expect(commands[0].command).to.equals('nvm install $NODE_VERSION');
    expect(commands[1].command).to.equals('npm install');
    expect(commands[2].command).to.equals('npm run-script test');
    expect(commands.length).to.equals(3);
  });

  it(`filter and sort commands for install and script`, () => {
    const process: any = {
      build_id: 502,
      job_id: 2123,
      status: 'queued',
      commands:
       [ { command: 'git clone https://github.com/Izak88/d3-bundle.git -b master .', type: 'git' },
         { command: 'git fetch origin master', type: 'git' },
         { command: 'npm run-script test', type: 'script' },
         { command: 'git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5 .', type: 'git' },
         { command: 'node ./test.js', type: 'script' },
         { command: 'node deploy.js', type: 'deploy' },
         { command: 'node success.js', type: 'after_success' },
         { command: 'node deploy2.js', type: 'deploy' },
         { command: 'node after_failure.js', type: 'after_failure' },
         { command: 'node before_deploy.js', type: 'before_deploy' },
         { command: 'node after_success.js', type: 'after_success' },
         { command: 'node install.js', type: 'install' },
         { command: 'node after_deploy2.js', type: 'after_deploy' },
         { command: 'node after_script.js', type: 'after_script' },
         { command: 'npm install', type: 'install' } ],
      cache: [ 'node_modules' ],
      repo_name: 'Izak88/d3-bundle',
      branch: 'master',
      env: [ 'NODE_VERSION=8' ],
      image_name: 'abstruse',
      exposed_ports: null,
      log: []
    };

    const types = [CommandType.git, CommandType.script, CommandType.after_failure,
      CommandType.deploy, CommandType.after_success, CommandType.before_deploy];
    let commands = prepareCommands(process, types);

    expect(commands[0].command).to.include('git clone https://github.com/Izak88/d3-bundle.');
    expect(commands[1].command).to.equals('git fetch origin master');
    expect(commands[2].command).to.include('git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5');
    expect(commands[3].command).to.equals('npm run-script test');
    expect(commands[4].command).to.equals('node ./test.js');
    expect(commands[5].command).to.equals('node success.js');
    expect(commands[6].command).to.equals('node after_success.js');
    expect(commands[7].command).to.equals('node after_failure.js');
    expect(commands[8].command).to.equals('node before_deploy.js');
    expect(commands[9].command).to.equals('node deploy.js');
    expect(commands[10].command).to.equals('node deploy2.js');
    expect(commands.length).to.equals(11);
  });

  it(`filter and sort commands for install and script`, () => {
    const process: any = {
      build_id: 502,
      job_id: 2123,
      status: 'queued',
      commands:
       [ { command: 'git clone https://github.com/Izak88/d3-bundle.git -b master .', type: 'git' },
         { command: 'git fetch origin master', type: 'git' },
         { command: 'npm run-script test', type: 'script' },
         { command: 'git checkout 582e1e2ece8ec7a866885913dd4d8d088068edd5 .', type: 'git' },
         { command: 'node ./test.js', type: 'script' },
         { command: 'node deploy.js', type: 'deploy' },
         { command: 'node success.js', type: 'after_success' },
         { command: 'node deploy2.js', type: 'deploy' },
         { command: 'node after_failure.js', type: 'after_failure' },
         { command: 'node before_deploy.js', type: 'before_deploy' },
         { command: 'node after_success.js', type: 'after_success' },
         { command: 'node install.js', type: 'install' },
         { command: 'node after_deploy2.js', type: 'after_deploy' },
         { command: 'node after_script.js', type: 'after_script' },
         { command: 'npm install', type: 'install' } ],
      cache: [ 'node_modules' ],
      repo_name: 'Izak88/d3-bundle',
      branch: 'master',
      env: [ 'NODE_VERSION=8' ],
      image_name: 'abstruse',
      exposed_ports: null,
      log: []
    };

    const types = [CommandType.install, CommandType.after_success];
    let commands = prepareCommands(process, types);

    expect(commands[0].command).to.equals('node install.js');
    expect(commands[1].command).to.equals('npm install');
    expect(commands[2].command).to.equals('node success.js');
    expect(commands[3].command).to.equals('node after_success.js');
    expect(commands.length).to.equals(4);
  });
});
