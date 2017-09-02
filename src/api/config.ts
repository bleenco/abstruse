import { createTempDir, getBitBucketAccessToken } from './utils';
import { spawn } from './process';
import * as sh from 'shelljs';
import { existsSync, rmdir } from './fs';
import { join } from 'path';
import * as yaml from 'yamljs';

export enum Language {
  android,
  java,
  node_js,
  python
}

export enum CacheType {
  bundler,
  yarn,
  pip,
  ccache,
  packages,
  cargo
}

export enum CommandType {
  before_install,
  install,
  before_script,
  script,
  before_cache,
  after_success,
  after_failure,
  before_deploy,
  deploy,
  after_deploy,
  after_script
}

export interface Build {
  env?: string;
  rvm?: string;
  gemfile?: string;
  python?: string;
  node_js?: string;
}

export interface Matrix {
  include: Build[];
  exclude: Build[];
  allow_failures: Build[];
}

export interface Command {
  command: string;
  type: CommandType;
  env?: string[];
}

export interface CommandsAndEnv {
  commands: Command[];
  env: string[];
}

export interface Repository {
  url: string;
  branch?: string;
  clone_depth?: number;
  pull_request?: number;
  sha?: string;
}

export interface Config {
  language?: Language;
  os?: string;
  // git: { repository_url: string, depth?: number, pr?: number, sha?: string };
  cache?: { [key: string]: string }[] | null;
  branches?: { test: string[], ignore: string[] };
  env?: { global: string[], matrix: string[] };
  before_install?: { command: string, type: CommandType }[];
  install: { command: string, type: CommandType }[];
  before_script?: { command: string, type: CommandType }[];
  script: { command: string, type: CommandType }[];
  before_cache?: { command: string, type: CommandType }[];
  after_success?: { command: string, type: CommandType }[];
  after_failure?: { command: string, type: CommandType }[];
  before_deploy?: { command: string, type: CommandType }[];
  deploy?: { command: string, type: CommandType }[];
  after_deploy?: { command: string, type: CommandType }[];
  after_script?: { command: string, type: CommandType }[];
  matrix?: Matrix;
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
    branches: null,
    env: null,
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
  config.branches = parseBranches(data.branches || null);
  config.env = parseEnv(data.env || null);

  config.before_install = parseCommands(data.before_install || null, CommandType.before_install);
  config.install = parseCommands(data.install || null, CommandType.install);
  config.before_script = parseCommands(data.before_script || null, CommandType.before_script);
  config.script = parseCommands(data.script || null, CommandType.script);
  config.before_cache = parseCommands(data.before_cache || null, CommandType.before_cache);
  config.after_success = parseCommands(data.after_success || null, CommandType.after_success);
  config.after_failure = parseCommands(data.after_failure || null, CommandType.after_failure);
  config.before_deploy = parseCommands(data.before_deploy || null, CommandType.before_deploy);
  config.deploy = parseCommands(data.deploy || null, CommandType.deploy);
  config.after_deploy = parseCommands(data.after_deploy || null, CommandType.after_deploy);
  config.after_script = parseCommands(data.after_script || null, CommandType.after_script);

  config.matrix = parseMatrix(data.matrix || null);

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

function parseBranches(branches: any | null): { test: string[], ignore: string[] } | null {
  if (!branches) {
    return null;
  } else {
    if (Array.isArray(branches)) {
      return { test: branches, ignore: [] };
    } else if (typeof branches === 'object') {
      let only = [], except = [];
      if (branches && branches.only) {
        only = branches.only;
      }

      if (branches && branches.except) {
        except = branches.except;
      }

      return { test: only, ignore: except };
    } else {
      throw new Error(`Unknown format for property branches.`);
    }
  }
}

function parseEnv(env: any | null): { global: string[], matrix: string[] } | null {
  if (!env) {
    return null;
  } else {
    if (typeof env === 'object') {
      let global = [];
      let matrix = [];
      if (env.global) {
        if (Array.isArray(env.global)) {
          global = env.global;
        } else {
          throw new Error(`Unknown format for property env.global.`);
        }
      }

      if (env.matrix) {
        if (Array.isArray(env.matrix)) {
          matrix = env.matrix;
        } else {
          throw new Error(`Unknown format for property env.matrix.`);
        }
      }

      return { global, matrix };
    } else {
      throw new Error(`Unknown format for property env.`);
    }
  }
}

function parseCommands(
  commands: any | null, type: CommandType
): { command: string, type: CommandType }[] {
  if (!(type in CommandType)) {
    throw new Error(`Command type must enum of CommandType.`);
  }

  if (!commands) {
    return [];
  } else {
    if (typeof commands === 'string') {
      return [{ command: commands, type: type }];
    } else if (Array.isArray(commands)) {
      return commands.map(cmd => ({ command: cmd, type: type }));
    } else {
      throw new Error(`Unknown or invalid type of commands specified.`);
    }
  }
}

function parseMatrix(matrix: any | null): Matrix | null {
  if (!matrix) {
    return null;
  } else {
    if (Array.isArray(matrix)) {
      const include = matrix.map((m: Build) => m);
      return { include: include, exclude: [], allow_failures: [] };
    } else if (typeof matrix === 'object') {
      let include = [];
      let exclude = [];
      let allowFailures = [];

      if (matrix.include && Array.isArray(matrix.include)) {
        include = matrix.include;
      }

      if (matrix.exclude && Array.isArray(matrix.exclude)) {
        exclude = matrix.exclude;
      }

      if (matrix.allow_failures && Array.isArray(matrix.allow_failures)) {
        allowFailures = matrix.allow_failures;
      }

      return { include: include, exclude: exclude, allow_failures: allowFailures };
    } else {
      throw new Error(`Unknown or invalid matrix format.`);
    }
  }
}

export function generateCommandsAndEnv(repo: Repository, config: Config): CommandsAndEnv[] {
  let data: CommandsAndEnv[] = [];

  // global environment variables
  const globalEnv = config.env && config.env.global || [];

  // 1. clone repository
  const splitted = repo.url.split('/');
  const name = splitted[splitted.length - 1].replace(/\.git/, '');
  // TODO: update to ${ABSTRUSE_BUILD_DIR}, private repos also
  const clone = `git clone -q ${repo.url} -b ${repo.branch} .`;

  // 2. fetch & checkout
  let fetch = null;
  let checkout = null;

  if (repo.pull_request) {
    fetch = `git fetch origin pull/${repo.pull_request}/head:pr${repo.pull_request}`;
    checkout = `git checkout pr${repo.pull_request}`;
  } else if (repo.sha) {
    fetch = `git fetch origin`;
    checkout = `git checkout ${repo.sha} .`;
  }

  const beforeInstall = config.before_install || [];
  const install = config.install || []; // TODO: specific languages
  const beforeScript = config.before_script || [];
  const script = config.script || []; // TODO: specific languages
  const beforeCache = config.before_cache || [];
  const afterSuccess = config.after_success || [];
  const afterFailure = config.after_failure || [];
  const beforeDeploy = config.before_deploy || [];
  const deploy = config.deploy || [];
  const afterDeploy = config.after_deploy || [];
  const afterScript = config.after_script || [];

  if (config.matrix) {
    data = config.matrix.include.map(i => {
      const env = globalEnv.concat(i.env);
      const commands = []
        .concat(beforeInstall)
        .concat(install)
        .concat(beforeScript)
        .concat(script)
        .concat(beforeCache)
        .concat(afterSuccess)
        .concat(afterFailure)
        .concat(beforeDeploy)
        .concat(deploy)
        .concat(afterDeploy)
        .concat(afterScript);

      return { commands, env  };
    });
  } else {
    const commands = []
      .concat(beforeInstall)
      .concat(install)
      .concat(beforeScript)
      .concat(script)
      .concat(beforeCache)
      .concat(afterSuccess)
      .concat(afterFailure)
      .concat(beforeDeploy)
      .concat(deploy)
      .concat(afterDeploy)
      .concat(afterScript);

    data.push({ commands: commands, env: globalEnv });
  }

  return data;
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
