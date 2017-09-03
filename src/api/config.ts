import { spawn } from 'child_process';
import { readdir, readFile } from 'fs';
import * as yaml from 'yamljs';
import * as temp from 'temp';

export enum Language {
  android = 'android',
  java = 'java',
  node_js = 'node_js',
  python = 'python'
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
  git = 'git',
  before_install = 'before_install',
  install = 'install',
  before_script = 'before_script',
  script = 'script',
  before_cache = 'before_cache',
  after_success = 'after_success',
  after_failure = 'after_failure',
  before_deploy = 'before_deploy',
  deploy = 'deploy',
  after_deploy = 'after_deploy',
  after_script = 'after_script'
}

export enum JobStage {
  test = 'test',
  deploy = 'deploy'
}

export interface Build {
  env?: string;
  rvm?: string;
  gemfile?: string;
  python?: string;
  node_js?: string;
  jdk?: string;
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
  display_env: string | null;
  display_version: string | null;
  language: Language;
  version?: string;
}

export interface Repository {
  clone_url: string;
  branch?: string;
  clone_depth?: number;
  pr?: number;
  sha?: string;
  file_tree?: string[];
  access_token?: string;
}

export interface Config {
  language?: Language;
  os?: string;
  // git: { repository_url: string, depth?: number, pr?: number, sha?: string };
  stage?: JobStage;
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
  jobs?: { include?: Config[], exclude?: Config[] };
  matrix?: Matrix;
  android?: { components: string[] };
  node_js?: string[];
  jdk?: string[];
}

export function getRemoteParsedConfig(repository: any): Promise<JobsAndEnv[]> {
  return new Promise((resolve, reject) => {
    let cloneUrl = repository.clone_url;
    let cloneDir = null;
    let fileTree: string[];

    createGitTmpDir()
      .then(dir => cloneDir = dir)
      .then(() => spawnGit(['clone', cloneUrl, '--depth', '1', cloneDir]))
      .then(() => readGitDir(cloneDir))
      .then(files => repository.file_tree = files)
      .then(() => {
        if (repository.file_tree.indexOf('.abstruse.yml') === -1) {
          const err = new Error(`Repository doesn't contains '.abstruse.yml' configuration file.`);
          return Promise.reject(err);
        } else {
          return Promise.resolve();
        }
      })
      .then(() => readAbstruseConfigFile(cloneDir))
      .then(config => yaml.parse(config))
      .then(json => parseConfig(json))
      .then(parsed => generateJobsAndEnv(repository, parsed))
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

export function parseConfig(data: any): Config {
  const main = parseJob(data);
  main.matrix = parseMatrix(data.matrix || null);

  if (data.jobs) {
    main.jobs.include = data.jobs.include ? data.jobs.include.map(job => parseJob(job)) : [];
    main.jobs.exclude = data.jobs.exclude ? data.jobs.exclude.map(job => parseJob(job)) : [];
  }

  return main;
}

function parseJob(data: any): Config {
  const config: Config = {
    language: null,
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
    matrix: null,
    android: null,
    node_js: null,
    jdk: null
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

  config.node_js = parseVersions(data.node_js || null);
  config.jdk = parseVersions(data.jdk || null);

  return config;
}

function parseVersions(data: any): string[] {
  if (!data) {
    return null;
  } else {
    if (typeof data === 'string') {
      return [data];
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error(`Unknown data format for language specific config.`);
    }
  }
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

export function generateJobsAndEnv(repo: Repository, config: Config): JobsAndEnv[] {
  let data: JobsAndEnv[] = [];

  // check if it's branch that we want to build
  if (!checkBranches(repo.branch, config.branches)) {
    return [];
  }

  // global and matrix environment variables
  const globalEnv = config.env && config.env.global || [];
  const matrixEnv = config.env && config.env.matrix || [];

  // 1. clone repository
  const splitted = repo.clone_url.split('/');
  const name = splitted[splitted.length - 1].replace(/\.git/, '');
  // TODO: update to ${ABSTRUSE_BUILD_DIR}, private repos also
  const clone = `git clone -q ${repo.clone_url} -b ${repo.branch} .`;

  // 2. fetch & checkout
  let fetch = null;
  let checkout = null;

  if (repo.pr) {
    fetch = `git fetch origin pull/${repo.pr}/head:pr${repo.pr}`;
    checkout = `git checkout pr${repo.pr}`;
  } else if (repo.sha) {
    fetch = `git fetch origin`;
    checkout = `git checkout ${repo.sha} .`;
  }

  // 3. generate commands
  const installCommands = []
    .concat(config.before_install || [])
    .concat(config.install || []);

  const testCommands = []
    .concat(config.before_script || [])
    .concat(config.script || [])
    .concat(config.before_cache || [])
    .concat(config.after_success || [])
    .concat(config.after_failure || []);

  const deployCommands = []
    .concat(config.before_deploy || [])
    .concat(config.deploy || [])
    .concat(config.after_deploy || [])
    .concat(config.after_script || []);

  // 4. generate jobs outta commands
  data = data.concat(matrixEnv.map(menv => {
    const env = globalEnv.concat(menv);
    return {
      commands: installCommands.concat(testCommands),
      env: env,
      stage: JobStage.test,
      display_env: env[env.length - 1] || null,
      display_version: null,
      language: config.language
    };
  })).concat(config.matrix.include.map(i => {
    const env = globalEnv.concat(i.env || []);
    const version = i.node_js || i.jdk || null;
    return {
      commands: installCommands.concat(testCommands),
      env: env,
      stage: JobStage.test,
      display_env: env[env.length - 1] || null,
      display_version: null,
      language: config.language,
      version: version
    };
  })).concat(config.jobs.include.map((job, i) => {
    const env = globalEnv.concat(job.env && job.env.global || []);
    const version = job.node_js || job.jdk || null;

    const jobInstallCommands = []
      .concat(job.before_install || [])
      .concat(job.install || []);

    const jobTestCommands = []
      .concat(job.before_script || [])
      .concat(job.script || [])
      .concat(job.before_cache || [])
      .concat(job.after_success || [])
      .concat(job.after_failure || []);

    const jobDeployCommands = []
      .concat(job.before_deploy || [])
      .concat(job.deploy || [])
      .concat(job.after_deploy || [])
      .concat(job.after_script || []);

    return {
      commands: jobInstallCommands.concat(jobTestCommands).concat(jobDeployCommands),
      env: env,
      stage: job.stage,
      display_env: env[env.length - 1] || null,
      display_version: null,
      language: config.language,
      version: version[i]
    };
  }));

  if (!data.length) {
    if (config.node_js) {
      config.node_js.forEach(version => {
        const scriptCommand = {
          commands: installCommands.concat(testCommands),
          env: globalEnv,
          stage: JobStage.test,
          display_env: globalEnv[globalEnv.length - 1] || null,
          display_version: null,
          language: config.language,
          version: version
        };
        data.push(scriptCommand);
      });
    } else {
      const scriptCommand = {
        commands: installCommands.concat(testCommands),
        env: globalEnv,
        stage: JobStage.test,
        display_env: globalEnv[globalEnv.length - 1] || null,
        display_version: null,
        language: config.language,
        version: null
      };
      data.push(scriptCommand);

      if (deployCommands.length) {
        data.push({
          commands: installCommands.concat(deployCommands),
          env: globalEnv,
          stage: JobStage.deploy,
          display_env: globalEnv[globalEnv.length - 1] || null,
          display_version: null,
          language: config.language
        });
      }
    }
  }

  data = data.map(d => {
    if (!d.commands.length) {
      const def = getDefaultJobCommands(config.language, repo.file_tree, d.version || null);
      const install = def.install[0].command;
      const script = def.script[0].command;
      d.commands.push({ command: install, type: CommandType.install, env: globalEnv });
      d.commands.push({ command: script, type: CommandType.script, env: globalEnv });
    } else {
      const install = d.commands.find(cmd => cmd.type === CommandType.install);
      const script = d.commands.find(cmd => cmd.type === CommandType.script);
      if (!install || !script) {
        const def = getDefaultJobCommands(config.language, repo.file_tree, d.version || null);

        if (!install && def.install.length) {
          const i = def.install[0].command || null;
          d.commands.push({ command: i, type: CommandType.install, env: globalEnv });
        }

        if (!script && def.script.length) {
          const s = def.script[0].command || null;
          d.commands.push({ command: s, type: CommandType.script, env: globalEnv });
        }
      }
    }

    if (d.language === 'java' && d.version) {
      d.display_version = `JDK: ${d.version}`;
    } else if (d.language === 'node_js' && d.version) {
      d.display_version = `NodeJS: ${d.version}`;
    }

    d.commands.unshift(...[
      { command: clone, type: CommandType.git },
      { command: fetch, type: CommandType.git },
      { command: checkout, type: CommandType.git }
    ]);

    d.commands = d.commands.filter(cmd => !!cmd.command);

    return d;
  });

  return data;
}

function checkBranches(branch: string, branches: { test: string[], ignore: string[] }): boolean {
  if (!branches) {
    return true;
  } else {
    let ignore = false;
    let test = false;

    branches.ignore.forEach(ignored => {
      const regex: RegExp = new RegExp(ignored);
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
      const regex: RegExp = new RegExp(tested);
      if (regex.test(branch)) {
        if (!test) {
          test = true;
        }
      }
    });

    return test;
  }
}

function getDefaultJobCommands(
  lang: Language, fileTree: string[], version: string
): { install: Command[], script: Command[] } {
  let def: { install: Command[], script: Command[] };

  switch (lang) {
    case 'java':
      def = getJavaDefaultCommands(fileTree);
    break;
    case 'node_js':
      def = getNodeJSDefaultCommands(fileTree, version);
    break;
    default:
      def = { install: [], script: [] };
    break;
  }

  return def;
}

// default commands for language 'java'
function getJavaDefaultCommands(fileTree: string[]): { install: Command[], script: Command[] } {
  if (inTree(fileTree, 'pom.xml') && !inTree(fileTree, 'build.gradle')) {
    if (inTree(fileTree, 'mvnw')) {
      return {
        install: [{
          command: './mvnw install -DskipTests=true -Dmaven.javadoc.skip=true -B -V',
          type: CommandType.install
        }],
        script: [{ command: './mvnw test -B', type: CommandType.script }]
      };
    } else {
      return {
        install: [{
          command: 'mvn install -DskipTests=true -Dmaven.javadoc.skip=true -B -V',
          type: CommandType.install
        }],
        script: [{ command: 'mvn test -B', type: CommandType.script }]
      };
    }
  } else if (inTree(fileTree, 'build.gradle')) {
    if (!inTree(fileTree, 'gradlew')) {
      return {
        install: [{ command: 'gradle assemble', type: CommandType.install }],
        script: [{ command: 'gradle check', type: CommandType.script }]
      };
    } else {
      return {
        install: [{ command: './gradlew assemble', type: CommandType.install }],
        script: [{ command: './gradlew check', type: CommandType.script }],
      };
    }
  } else {
    return {
      install: [], // there's no standard way of installing deps using Ant
      script: [{ command: 'ant test', type: CommandType.script }],
    };
  }
}

// default commands for language 'node_js'
function getNodeJSDefaultCommands(
  fileTree: string[],
  version: string
): { install: Command[], script: Command[] } {
  if (inTree(fileTree, 'package.json')) {
    if (inTree(fileTree, 'yarn.lock') && parseInt(version, 10) >= 4) {
      return {
        install: [{ command: 'yarn', type: CommandType.install }],
        script: [{ command: 'yarn test', type: CommandType.script }]
      };
    } else {
      return {
        install: [{ command: 'npm install', type: CommandType.install }],
        script: [{ command: 'npm test', type: CommandType.script }]
      };
    }
  } else {
    return { install: [], script: [] };
  }
}

function inTree(fileTree: string[], search: string): boolean {
  return fileTree.indexOf(search) !== -1 ? true : false;
}

function spawnGit(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const git = spawn('git', args, { detached: true });

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
