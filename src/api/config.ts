import { createTempDir, getBitBucketAccessToken } from './utils';
import { spawn } from './process';
import * as sh from 'shelljs';
import { existsSync, rmdir } from './fs';
import { join } from 'path';
import * as yaml from 'yamljs';

export enum Languages {
  Android = 'android',
  NodeJS = 'node_js'
}

export interface Config {
  language?: Languages;
  git: { repository_url: string, depth?: number, pr?: number, sha?: string };
  cache?: string[];
  before_install?: string[];
  install: string[] | true;
  before_script?: string[];
  script: string[];
  before_cache?: string[];
  after_success?: string[];
  after_failure?: string[];
  before_deploy?: string[];
  deploy?: string[];
  after_deploy?: string[];
  after_script?: string[];
  matrix?: {
    node_js?: string;
    env: string;
  }[];
  android?: { components: string[] };
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

export function parseConfig()






export function generateCommands(repositoryUrl: string, config: Config): any[] {
  let matrix = [];

  // 1. clone
  const splitted = repositoryUrl.split('/');
  const name = splitted[splitted.length - 1].replace(/\.git/, '');
  let cloneCommand = `git clone -q ${repositoryUrl} .`;

  // 2. fetch & checkout commands
  let fetchCommand = '';
  let checkoutCommand = '';
  if (config.git && config.git.pr) {
    fetchCommand = `git fetch origin pull/${config.git.pr}/head:pr${config.git.pr}`;
    checkoutCommand = `git checkout pr${config.git.pr}`;
  } else if (config.git && config.git.sha) {
    fetchCommand = `git fetch origin`;
    checkoutCommand = `git checkout ${config.git.sha} .`;
  }

  // 3. environment
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

      return [cloneCommand, fetchCommand, checkoutCommand, install, env]
        .filter(cmd => cmd !== '');
    });
  }

  // 4. commands
  const preinstall = config.preinstall || [];
  const install = config.install || [];
  const postinstall = config.postinstall || [];
  const pretest = config.pretest || [];
  const test = config.test || [];
  const posttest = config.posttest || [];

  const commonCommands = []
    .concat(preinstall)
    .concat(install)
    .concat(postinstall)
    .concat(pretest)
    .concat(test)
    .concat(posttest);

  matrix = matrix.map(mat => {
    return mat.concat(commonCommands);
  });

  return matrix;
}

export function getRepositoryDetails(repository, sha = null, pr = null): Promise<RepositoryInfo> {
  return new Promise((resolve, reject) => {
    let cloneDir = null;
    let configPath = null;
    let yml = null;
    let log = null;

    createTempDir()
      .then(tempDir => {
        let cloneUrl = repository.clone_url;
        cloneDir = tempDir;
        if (repository.private && repository.access_token) {
          if (repository.github_id || repository.gogs_id) {
            cloneUrl = cloneUrl.replace('https://', `https://${repository.access_token}@`);
          } else if (repository.gitlab_id) {
            cloneUrl =
              cloneUrl.replace('https://', `https://gitlab-ci-token:${repository.access_token}@`);
          } else if (repository.bitbucket_id && repository.private && repository.access_token) {
            return getBitBucketAccessToken(repository.access_token)
              .then(response => {
                let access_token = response.access_token;
                let cloneUrl =
                  repository.clone_url.replace('https://', `https://x-token-auth:${access_token}@`);

                return spawn('git', ['clone', cloneUrl, '--depth', '1', cloneDir]);
              }).catch(err => Promise.reject(err));
          }
        }

        return spawn('git', ['clone', cloneUrl, '--depth', '1', cloneDir]);
      })
      .then(cloned => cloned.exit === 0 ? Promise.resolve() : Promise.reject(''))
      .then(() => {
        if (existsSync(cloneDir) && existsSync(join(cloneDir, '.git'))) {
          return Promise.resolve();
        } else {
          return Promise.reject(`${cloneDir} does not exists`);
        }
      })
      .then(() => {
        if (pr) {
          return spawn('git', [
              '--git-dir',
              join(cloneDir, '.git'),
              '--work-tree',
              cloneDir,
              'fetch',
              'origin',
              `pull/${pr}/head:pr${pr}`
            ])
            .then(() => spawn('git', [
              '--git-dir',
              join(cloneDir, '.git'),
              '--work-tree',
              cloneDir,
              'checkout',
              `pr${pr}`
            ]))
            .then(() => Promise.resolve());
        } else if (sha) {
          return spawn('git', [
              '--git-dir',
              join(cloneDir, '.git'),
              '--work-tree',
              cloneDir,
              'fetch',
              'origin'
            ])
            .then(() => spawn('git', [
              '--git-dir',
              join(cloneDir, '.git'),
              '--work-tree',
              cloneDir,
              'checkout',
              sha
            ]))
            .then(() => Promise.resolve());
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        let configPath = join(cloneDir, '.abstruse.yml');
        if (!existsSync(configPath)) {
          return Promise.reject(`${configPath} does not exists`);
        } else {
          return Promise.resolve(sh.cat(configPath));
        }
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
