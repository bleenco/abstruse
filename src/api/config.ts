import { createTempDir } from './utils';
import { spawn } from './process';
import * as sh from 'shelljs';
import { existsSync, rmdir } from './fs';
import { join } from 'path';
import * as yaml from 'yamljs';

export interface Config {
  language?: string;
  git: { depth: number, pr?: number, sha?: string };
  matrix?: { node_js?: string; env: string }[];
  preinstall?: string[];
  install?: string[];
  postinstall?: string[];
  pretest?: string[];
  test: string[];
  posttest: string[];
}

export interface GitLog {
  commit_hash: string;
  commit_author: string;
  commit_date: Date;
  commit_message: string;
}

export interface RepositoryInfo {
  config: Config;
  log?: GitLog;
}

export function generateCommands(repositoryUrl: string, config: Config): any[] {
  let matrix = [];

  // 1. clone
  const splitted = repositoryUrl.split('/');
  const name = splitted[splitted.length - 1].replace(/\.git/, '');
  let cloneCommand = `git clone ${repositoryUrl} ${name}`;

  if (config.git && config.git.depth) {
    cloneCommand = `${cloneCommand} --depth ${config.git.depth}`;
  }

  // 2. cd into directory
  const cdCommand = `cd ${name}`;

  // 3. fetch & checkout commands
  let fetchCommand = '';
  let checkoutCommand = '';
  if (config.git && config.git.pr) {
    fetchCommand = `git fetch origin pull/${config.git.pr}/head:pr${config.git.pr}`;
    checkoutCommand = `git checkout pr${config.git.pr}`;
  } else if (config.git && config.git.sha) {
    fetchCommand = `git fetch origin`;
    checkoutCommand = `git checkout ${config.git.sha}`;
  }

  // 4. environment
  if (config.matrix) {
    matrix = config.matrix.map(mat => {
      let install = '';
      let env = '';

      if (mat.node_js) {
        install = `nvm install ${mat.node_js}`;
      }

      if (mat.env) {
        env = `export ${mat.env}`;
      }

      return [cloneCommand, cdCommand, fetchCommand, checkoutCommand, install, env]
        .filter(cmd => cmd !== '');
    });
  }

  // 5. commands
  const preinstall = config.preinstall || [];
  const install = config.install || [];
  const postinstall = config.postinstall || [];
  const pretest = config.pretest || [];
  const test = config.test || [];
  const posttest = config.posttest || [];

  // 6. exit code
  const exitcode = ['exit $?'];

  const commonCommands = []
    .concat(preinstall)
    .concat(install)
    .concat(postinstall)
    .concat(pretest)
    .concat(test)
    .concat(posttest)
    .concat(exitcode);

  matrix = matrix.map(mat => {
    return mat.concat(commonCommands);
  });

  return matrix;
}

export function getRepositoryDetails(url: string): Promise<RepositoryInfo> {
  return new Promise((resolve, reject) => {
    let cloneDir = null;
    let configPath = null;
    let yml = null;
    let log = null;

    createTempDir()
      .then(tempDir => {
        cloneDir = tempDir;
        return spawn('git', ['clone', url, '--depth', '1', cloneDir]);
      })
      .then(cloned => {
        let configPath = join(cloneDir, '.abstruse.yml');
        if (cloned.exit !== 0 || !existsSync(configPath)) {
          reject();
        }

        return sh.cat(configPath);
      })
      .then(configYml => yml = yaml.parse(configYml))
      .then(() => spawn('git', ['--git-dir', join(cloneDir, '.git'), '--no-pager', 'log', '-1']))
      .then(gitLog => log = parseGitLog(gitLog.stdout))
      .then(() => rmdir(cloneDir))
      .then(() => resolve({ config: yml, log: log }))
      .catch(err => reject(err));
  });
}

function parseGitLog(str: string): GitLog {
  let splitted = str.split('\n');
  return {
    commit_hash: splitted[0].replace(/commit/, '').replace(/\(.*\)/, '').trim(),
    commit_author: splitted[1].replace(/Author:/, '').trim(),
    commit_date: new Date(splitted[2].replace(/Date:/, '').trim()),
    commit_message: splitted[4].trim()
  };
}
