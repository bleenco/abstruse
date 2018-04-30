import { spawn } from 'child_process';
import { readdir, readFile } from 'fs';
import * as yaml from 'js-yaml';
import * as temp from 'temp';
import { getHttpJsonResponse } from './utils';

export enum CommandType {
  git = 'git',
  before_install = 'before_install',
  install = 'install',
  before_script = 'before_script',
  script = 'script',
  before_cache = 'before_cache',
  restore_cache = 'restore_cache',
  store_cache = 'store_cache',
  after_success = 'after_success',
  after_failure = 'after_failure',
  before_deploy = 'before_deploy',
  deploy = 'deploy',
  after_deploy = 'after_deploy',
  after_script = 'after_script'
}

export enum CommandTypePriority {
  git = 1,
  before_install = 2,
  install = 3,
  before_script = 4,
  script = 5,
  before_cache = 6,
  restore_cache = 7,
  store_cache = 8,
  after_success = 9,
  after_failure = 10,
  after_script = 11,
  before_deploy = 12,
  deploy = 13,
  after_deploy = 14
}

export enum JobStage {
  test = 'test',
  deploy = 'deploy'
}

export interface Build {
  image?: string;
  env?: string;
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

export interface JobsAndEnv {
  commands: Command[];
  env: string[];
  stage: JobStage;
  image: string;
  version?: string;
  cache?: string[];
}

export interface Repository {
  clone_url: string;
  branch: string;
  clone_depth?: number;
  pr?: number;
  sha?: string;
  file_tree?: string[];
  access_token?: string;
  type?: 'github' | 'bitbucket' | 'gogs' | 'gitlab';
}

export interface Config {
  image: string;
  os?: string;
  stage?: JobStage;
  cache?: string[] | null;
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
  jobs?: { include?: Config[], exclude?: Config[] };
  matrix?: Matrix;
}

export function getRemoteParsedConfig(repository: Repository): Promise<JobsAndEnv[]> {
  return new Promise((resolve, reject) => {
    let cloneUrl = repository.clone_url;
    let branch = repository.branch || 'master';
    let sha = repository.sha || null;
    let pr = repository.pr || null;
    let cloneDir = null;

    if (repository.access_token) {
      cloneUrl = cloneUrl.replace('//', `//${repository.access_token}@`);
    }

    createGitTmpDir()
      .then(dir => cloneDir = dir)
      .then(() => spawnGit(['clone', cloneUrl, '-b', branch, '--depth', '1', cloneDir]))
      .then(() => {
        if (sha || pr) {
          return checkoutShaOrPr(sha, pr, cloneDir, repository.type, repository.branch);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => readGitDir(cloneDir))
      .then(files => repository.file_tree = files)
      .then(() => {
        if (repository.file_tree.indexOf('.abstruse.yml') === -1) {
          let err = new Error(`Repository doesn't contains '.abstruse.yml' configuration file.`);
          return Promise.reject(err);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => readAbstruseConfigFile(cloneDir))
      .then(config => yaml.load(config))
      .then(json => parseConfig(json))
      .then(parsed => generateJobsAndEnv(repository, parsed))
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

export function parseConfig(data: any): Config {
  let main = parseJob(data);
  main.matrix = parseMatrix(data.matrix || null);

  if (data.jobs) {
    main.jobs.include = data.jobs.include ? data.jobs.include.map(job => parseJob(job)) : [];
    main.jobs.exclude = data.jobs.exclude ? data.jobs.exclude.map(job => parseJob(job)) : [];
  }

  return main;
}

export function parseConfigFromRaw(repository: Repository, raw: string): Promise<JobsAndEnv[]> {
  return new Promise((resolve, reject) => {
    return Promise.resolve()
      .then(() => yaml.load(raw))
      .then(json => parseConfig(json))
      .then(parsed => generateJobsAndEnv(repository, parsed))
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

export function checkRepositoryAccess(repository: Repository): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let cloneUrl = repository.clone_url;
    let branch = repository.branch || 'master';
    let cloneDir = null;

    if (repository.access_token) {
      cloneUrl = cloneUrl.replace('//', `//${repository.access_token}@`);
    }

    createGitTmpDir()
      .then(dir => cloneDir = dir)
      .then(() => spawnGit(['clone', cloneUrl, '-b', branch, '--depth', '1', cloneDir]))
      .then(() => resolve(true))
      .catch(err => resolve(false));
  });
}

export function checkConfigPresence(repository: Repository): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let cloneUrl = repository.clone_url;
    let branch = repository.branch || 'master';
    let cloneDir = null;

    if (repository.access_token) {
      cloneUrl = cloneUrl.replace('//', `//${repository.access_token}@`);
    }

    createGitTmpDir()
      .then(dir => cloneDir = dir)
      .then(() => spawnGit(['clone', cloneUrl, '-b', branch, '--depth', '1', cloneDir]))
      .then(() => readGitDir(cloneDir))
      .then(files => repository.file_tree = files)
      .then(() => {
        if (repository.file_tree.indexOf('.abstruse.yml') === -1) {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .catch(err => resolve(false));
  });
}

export function getConfigRawFile(repository: Repository): Promise<any> {
  return new Promise((resolve, reject) => {
    let cloneUrl = repository.clone_url;
    let branch = repository.branch || 'master';
    let cloneDir = null;

    if (repository.access_token) {
      cloneUrl = cloneUrl.replace('//', `//${repository.access_token}@`);
    }

    createGitTmpDir()
      .then(dir => cloneDir = dir)
      .then(() => spawnGit(['clone', cloneUrl, '-b', branch, '--depth', '1', cloneDir]))
      .then(() => readGitDir(cloneDir))
      .then(files => repository.file_tree = files)
      .then(() => {
        if (repository.file_tree.indexOf('.abstruse.yml') === -1) {
          resolve(false);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => readAbstruseConfigFile(cloneDir))
      .then(rawFile => resolve(rawFile))
      .catch(err => resolve(false));
  });
}

function parseJob(data: any): Config {
  let config: Config = {
    image: null,
    os: null,
    stage: data.stage || 'test',
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
    jobs: { include: [], exclude: [] },
    matrix: null
  };

  config.image = data.image || null;
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

  return config;
}

function parseOS(os: string | null): string {
  return 'linux'; // since we are compatible with travis configs, hardcode this to Linux
}

function parseCache(cache: any | null): string[] | null {
  if (!cache) {
    return null;
  } else {
    if (Array.isArray(cache)) {
      return cache;
    } else {
      return [];
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

function parseEnv(env: any | null): { global: string[], matrix: string[] } {
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
    } else if (typeof env === 'string') {
      return { global: [env], matrix: [] };
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

function parseMatrix(matrix: any | null): Matrix {
  if (!matrix) {
    return { include: [], exclude: [], allow_failures: [] };
  } else {
    if (Array.isArray(matrix)) {
      let include = matrix.map((m: Build) => m);
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

export function generateJobsAndEnv(repo: Repository, config: Config): JobsAndEnv[] {
  let data: JobsAndEnv[] = [];

  // check if it's branch that we want to build
  if (!checkBranches(repo.branch, config.branches)) {
    return [];
  }

  // global and matrix environment variables
  let globalEnv = config.env && config.env.global || [];
  let matrixEnv = config.env && config.env.matrix || [];

  // 1. clone repository
  let splitted = repo.clone_url.split('/');
  let name = splitted[splitted.length - 1].replace(/\.git/, '');
  // TODO: update to ${ABSTRUSE_BUILD_DIR}
  if (repo.access_token) {
    repo.clone_url = repo.clone_url.replace('//', `//${repo.access_token}@`);
  }

  let cloneBranch = repo.type === 'bitbucket' ? 'master' : repo.branch;
  let clone = `git clone -q ${repo.clone_url} -b ${cloneBranch} .`;

  // 2. fetch & checkout
  let fetch = null;
  let checkout = null;

  if (repo.pr) {
    if (repo.type === 'github') {
      fetch = `git fetch origin pull/${repo.pr}/head:pr${repo.pr}`;
      checkout = `git checkout pr${repo.pr}`;
    } else if (repo.type === 'bitbucket') {
      fetch = `git fetch origin ${repo.branch}`;
      checkout = `git checkout FETCH_HEAD`;
    }
  } else if (repo.sha) {
    fetch = `git fetch origin ${repo.branch}`;
    checkout = `git checkout ${repo.sha} .`;
  }

  // 3. generate commands
  let installCommands = []
    .concat(config.before_install || [])
    .concat(config.install || []);

  let testCommands = []
    .concat(config.before_script || [])
    .concat(config.script || [])
    .concat(config.before_cache || [])
    .concat(config.after_success || [])
    .concat(config.after_failure || [])
    .concat(config.after_script || []);

  let deployCommands = []
    .concat(config.before_deploy || [])
    .concat(config.deploy || [])
    .concat(config.after_deploy || []);

  // 4. generate jobs outta commands
  data = data.concat(matrixEnv.map(menv => {
    let env = globalEnv.concat(menv);
    return {
      commands: installCommands.concat(testCommands),
      env: env,
      stage: JobStage.test,
      image: config.image
    };
  })).concat(config.matrix.include.map(i => {
    let env = globalEnv.concat(i.env || []);
    return {
      commands: installCommands.concat(testCommands),
      env: env,
      stage: JobStage.test,
      image: i.image || config.image
    };
  })).concat(config.jobs.include.map((job, i) => {
    let env = globalEnv.concat(job.env && job.env.global || []);

    let jobInstallCommands = []
      .concat(job.before_install || [])
      .concat(job.install || []);

    let jobTestCommands = []
      .concat(job.before_script || [])
      .concat(job.script || [])
      .concat(job.before_cache || [])
      .concat(job.after_success || [])
      .concat(job.after_failure || [])
      .concat(job.after_script || []);

    let jobDeployCommands = []
      .concat(job.before_deploy || [])
      .concat(job.deploy || [])
      .concat(job.after_deploy || []);

    return {
      commands: jobInstallCommands.concat(jobTestCommands).concat(jobDeployCommands),
      env: env,
      stage: job.stage,
      image: config.image
    };
  }));

  data = data.map(d => {
    // add git commands in front
    d.commands.unshift(...[
      { command: clone, type: CommandType.git },
      { command: fetch, type: CommandType.git },
      { command: checkout, type: CommandType.git }
    ]);

    // apply cache to each job
    d.cache = config.cache;

    d.commands = d.commands.filter(cmd => !!cmd.command);

    return d;
  });

  if (deployCommands.length) {
    let gitCommands = [
      { command: clone, type: CommandType.git },
      { command: fetch, type: CommandType.git },
      { command: checkout, type: CommandType.git }
    ];

    data.push({
      commands: gitCommands.concat(deployCommands),
      env: globalEnv.concat('DEPLOY'),
      stage: JobStage.deploy,
      image: config.image
    });
  }

  return data;
}

function checkBranches(branch: string, branches: { test: string[], ignore: string[] }): boolean {
  if (!branches) {
    return true;
  } else {
    let ignore = false;
    let test = false;

    branches.ignore.forEach(ignored => {
      let regex: RegExp = new RegExp(ignored);
      if (regex.test(branch)) {
        if (!ignore) {
          ignore = true;
        }
      }
    });

    if (ignore) {
      return false;
    }

    branches.test.forEach(tested => {
      let regex: RegExp = new RegExp(tested);
      if (regex.test(branch)) {
        if (!test) {
          test = true;
        }
      }
    });

    return test;
  }
}

function spawnGit(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let git = spawn('git', args, { detached: true });

    git.stdout.on('data', data => {
      data = data.toString();
      if (/Username/.test(data)) {
        reject('Not authorized');
      }
    });

    git.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

function checkoutShaOrPr(
  sha: string, pr: number, dir: string, type: string, branch: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let fetch = null;
    let checkout = null;
    let gitDir = `--git-dir ${dir}/.git`;

    if (pr) {
      if (type === 'github') {
        fetch = `${gitDir} fetch origin pull/${pr}/head:pr${pr}`;
        checkout = `${gitDir} --work-tree ${dir} checkout pr${pr}`;
      } else if (type === 'bitbucket') {
        fetch = `${gitDir} fetch origin ${branch}`;
        checkout = `${gitDir} --work-tree ${dir} checkout FETCH_HEAD`;
      }
    } else if (sha) {
      fetch = `${gitDir} fetch origin ${branch}`;
      if (type === 'bitbucket') {
        checkout = `${gitDir} --work-tree ${dir} checkout FETCH_HEAD`;
      } else {
        checkout = `${gitDir} --work-tree ${dir} checkout ${sha}`;
      }
    }

    if (fetch && checkout) {
      spawnGit(fetch.split(' '))
        .then(() => spawnGit(checkout.split(' '))
          .then(() => resolve())
          .catch(err => reject(err)));
    } else {
      resolve();
    }
  });
}

function readAbstruseConfigFile(dirPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    readFile(dirPath + '/.abstruse.yml', (err, contents) => {
      if (err) {
        reject(err);
      } else {
        resolve(contents.toString());
      }
    });
  });
}

function readGitDir(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    readdir(dirPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function createGitTmpDir(): Promise<string> {
  return new Promise((resolve, reject) => {
    temp.mkdir('abstruse-git', (err, dirPath) => {
      if (err) {
        reject(err);
      } else {
        resolve(dirPath);
      }
    });
  });
}
