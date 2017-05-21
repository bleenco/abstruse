import { createTempDir } from './utils';
import { spawn } from './process';
import * as sh from 'shelljs';
import { existsSync, rmdir } from './fs';
import { join } from 'path';
import * as yaml from 'yamljs';

export interface Config {
  language?: string;
  matrix?: { [language: string]: string; env: string };
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
  log: GitLog;
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
