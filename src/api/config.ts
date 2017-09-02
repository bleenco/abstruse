import { createTempDir, getBitBucketAccessToken } from './utils';
import { spawn } from './process';
import * as sh from 'shelljs';
import { existsSync, rmdir } from './fs';
import { join } from 'path';
import * as yaml from 'yamljs';

export enum Language {
  android,
  java,
  node_js
}

export enum CacheType {
  bundler,
  yarn,
  pip,
  ccache,
  packages,
  cargo
}

export interface Config {
  language?: Language;
  os?: string;
  // git: { repository_url: string, depth?: number, pr?: number, sha?: string };
  cache?: { [key: string]: string }[] | null;
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
  node_js?: string[];
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

export function parseConfig(data: any): Config {
  let config: Config = {
    language: null,
    os: null,
    cache: null,
    before_install: null,
    install: null,
    before_script: null,
    script: null,
    before_cache: null,
    after_success: null,
    after_failure: null,
    before_deploy: null,
    deploy: null,
    after_deploy: null,
    after_script: null,
    matrix: null,
    android: null,
    node_js: null
  };

  config.language = parseLanguage(data.language || null);
  config.os = parseOS(data.os || null);
  config.cache = parseCache(data.cache || null);

  return config;
}

function parseLanguage(lang: Language | null): Language | null {
  if (lang) {
    if (lang in Language) {
      return lang;
    } else {
      throw new Error(`${lang} is not a known language for configuration.`);
    }
  } else {
    return null;
  }
}

function parseOS(os: string | null): string {
  return 'linux'; // since we are compatible with travis configs, hardcode this to Linux
}

function parseCache(cache: any | null): { [key: string]: string }[] | null {
  if (!cache) {
    return null;
  } else {
    if (typeof cache === 'string') {
      if (cache in CacheType) {
        switch (cache) {
          case 'bundler':
            return [ { bundler: 'vendor/bundle' } ];
          case 'yarn':
            return [ { yarn: '$HOME/.cache/yarn' } ];
          case 'pip':
            return [ { pip: '$HOME/.cache/pip' } ];
          case 'ccache':
            return [ { ccache: '$HOME/.ccache' } ];
          case 'packages':
            return [ { packages: '$HOME/R/Library' } ];
          case 'cargo':
            return [ { cargo: '$HOME/.cargo' } ];
        }
      } else {
        throw new Error(`${cache} is not a known option for caching.`);
      }
    } else if (typeof cache === 'object') {
      if (cache && cache.directories) {
        if (Array.isArray(cache.directories)) {
          return cache.directories.map(dir => ({ dir }));
        } else {
          throw new Error(`${cache.directories} is not a type of array.`);
        }
      } else {
        throw new Error(`Property directories must be defined.`);
      }
    }
  }
}

// export function generateCommands(repositoryUrl: string, config: Config): any[] {
//   let matrix = [];

//   // 1. clone
//   const splitted = repositoryUrl.split('/');
//   const name = splitted[splitted.length - 1].replace(/\.git/, '');
//   let cloneCommand = `git clone -q ${repositoryUrl} .`;

//   // 2. fetch & checkout commands
//   let fetchCommand = '';
//   let checkoutCommand = '';
//   if (config.git && config.git.pr) {
//     fetchCommand = `git fetch origin pull/${config.git.pr}/head:pr${config.git.pr}`;
//     checkoutCommand = `git checkout pr${config.git.pr}`;
//   } else if (config.git && config.git.sha) {
//     fetchCommand = `git fetch origin`;
//     checkoutCommand = `git checkout ${config.git.sha} .`;
//   }

//   // 3. environment
//   if (config.matrix) {
//     matrix = config.matrix.map(mat => {
//       let install = '';
//       let env = '';

//       if (mat.node_js) {
//         install = `nvm install ${mat.node_js}`;
//       }

//       if (mat.env) {
//         env = `export ${mat.env}`;
//       }

//       return [cloneCommand, fetchCommand, checkoutCommand, install, env]
//         .filter(cmd => cmd !== '');
//     });
//   }

//   // 4. commands
//   const preinstall = config.preinstall || [];
//   const install = config.install || [];
//   const postinstall = config.postinstall || [];
//   const pretest = config.pretest || [];
//   const test = config.test || [];
//   const posttest = config.posttest || [];

//   const commonCommands = []
//     .concat(preinstall)
//     .concat(install)
//     .concat(postinstall)
//     .concat(pretest)
//     .concat(test)
//     .concat(posttest);

//   matrix = matrix.map(mat => {
//     return mat.concat(commonCommands);
//   });

//   return matrix;
// }

// export function getRepositoryDetails(repository, sha = null, pr = null): Promise<RepositoryInfo> {
//   return new Promise((resolve, reject) => {
//     let cloneDir = null;
//     let configPath = null;
//     let yml = null;
//     let log = null;

//     createTempDir()
//       .then(tempDir => {
//         let cloneUrl = repository.clone_url;
//         cloneDir = tempDir;
//         if (repository.private && repository.access_token) {
//           if (repository.github_id || repository.gogs_id) {
//             cloneUrl = cloneUrl.replace('https://', `https://${repository.access_token}@`);
//           } else if (repository.gitlab_id) {
//             cloneUrl =
//               cloneUrl.replace('https://', `https://gitlab-ci-token:${repository.access_token}@`);
//           } else if (repository.bitbucket_id && repository.private && repository.access_token) {
//             return getBitBucketAccessToken(repository.access_token)
//               .then(response => {
//                 let access_token = response.access_token;
//                 let cloneUrl =
//                   repository.clone_url.replace('https://', `https://x-token-auth:${access_token}@`);

//                 return spawn('git', ['clone', cloneUrl, '--depth', '1', cloneDir]);
//               }).catch(err => Promise.reject(err));
//           }
//         }

//         return spawn('git', ['clone', cloneUrl, '--depth', '1', cloneDir]);
//       })
//       .then(cloned => cloned.exit === 0 ? Promise.resolve() : Promise.reject(''))
//       .then(() => {
//         if (existsSync(cloneDir) && existsSync(join(cloneDir, '.git'))) {
//           return Promise.resolve();
//         } else {
//           return Promise.reject(`${cloneDir} does not exists`);
//         }
//       })
//       .then(() => {
//         if (pr) {
//           return spawn('git', [
//               '--git-dir',
//               join(cloneDir, '.git'),
//               '--work-tree',
//               cloneDir,
//               'fetch',
//               'origin',
//               `pull/${pr}/head:pr${pr}`
//             ])
//             .then(() => spawn('git', [
//               '--git-dir',
//               join(cloneDir, '.git'),
//               '--work-tree',
//               cloneDir,
//               'checkout',
//               `pr${pr}`
//             ]))
//             .then(() => Promise.resolve());
//         } else if (sha) {
//           return spawn('git', [
//               '--git-dir',
//               join(cloneDir, '.git'),
//               '--work-tree',
//               cloneDir,
//               'fetch',
//               'origin'
//             ])
//             .then(() => spawn('git', [
//               '--git-dir',
//               join(cloneDir, '.git'),
//               '--work-tree',
//               cloneDir,
//               'checkout',
//               sha
//             ]))
//             .then(() => Promise.resolve());
//         } else {
//           return Promise.resolve();
//         }
//       })
//       .then(() => {
//         let configPath = join(cloneDir, '.abstruse.yml');
//         if (!existsSync(configPath)) {
//           return Promise.reject(`${configPath} does not exists`);
//         } else {
//           return Promise.resolve(sh.cat(configPath));
//         }
//       })
//       .then(configYml => yml = yaml.parse(configYml))
//       .then(() => spawn('git', ['--git-dir', join(cloneDir, '.git'), '--no-pager', 'log', '-1']))
//       .then(gitLog => log = parseGitLog(gitLog.stdout))
//       .then(() => rmdir(cloneDir))
//       .then(() => resolve({ config: yml, log: log }))
//       .catch(err => reject(err));
//   });
// }

// function parseGitLog(str: string): GitLog {
//   let splitted = str.split('\n');
//   return {
//     commit_hash: splitted[0].replace(/commit/, '').replace(/\(.*\)/, '').trim(),
//     commit_author: splitted[1].replace(/Author:/, '').trim(),
//     commit_date: new Date(splitted[2].replace(/Date:/, '').trim()),
//     commit_message: splitted[4].trim()
//   };
// }
