import { randomBytes } from 'crypto';
import {
  copy,
  ensureDir,
  ensureDirSync,
  pathExistsSync,
  readFileSync,
  readJson,
  remove,
  statSync,
  writeFileSync,
  writeJson,
} from 'fs-extra';
import * as glob from 'glob';
import { homedir } from 'os';
import { join, resolve } from 'path';
import * as uuid from 'uuid';

import { getHumanSize } from './utils';

let defaultConfig = {
  url: null,
  secret: 'defaultPassword',
  jwtSecret: randomString(),
  port: 6500,
  concurrency: 10,
  idleTimeout: 600,
  jobTimeout: 3600,
  ssl: false,
  sslcert: null,
  sslkey: null,
  publicKey: 'rsa.pub',
  privateKey: 'rsa.key',
  requireLogin: false,
  demo: false,
  db: {
    client: 'sqlite3',
    connection: {
      filename: './abstruse.sqlite'
    },
    useNullAsDefault: true
  }
};

export let abstruseHome = homedir();
export let config: any = defaultConfig;

export function setHome(dirPath: string): void {
  abstruseHome = dirPath;
}

export function initSetup(): Promise<string> {
  return makeAbstruseDir()
    .then(() => makeCacheDir())
    .then(() => ensureDir(getFilePath('images')))
    .then(() => ensureDir(getFilePath('base-images')))
    .then(() => {
      let srcDir = resolve(__dirname, '../../src/files/docker-essential');
      let destDir = getFilePath('docker-essential');
      return copy(srcDir, destDir);
    })
    .then(() => {
      let avatarDir = resolve(__dirname, '../../src/files/avatars');
      let destDir = getFilePath('avatars');
      return copy(avatarDir, destDir);
    })
    .then(() => getConfigAsync());
}

export function appReady(): boolean {
  return pathExistsSync(getFilePath('config.json')) && pathExistsSync(getFilePath('docker-essential'));
}

export function getRootDir(): string {
  return join(abstruseHome, 'abstruse');
}

export function getFilePath(relativePath: string): string {
  return join(getRootDir(), relativePath);
}

export function makeAbstruseDir(): Promise<void> {
  let abstruseDir = getRootDir();
  return ensureDir(abstruseDir);
}

export function makeCacheDir(): Promise<void> {
  let cachePath = getFilePath('cache');
  return ensureDir(cachePath);
}

export function createTempDir(): Promise<string> {
  let tempDir = getFilePath(`cache/${uuid()}`);
  return ensureDir(tempDir)
    .then(() => tempDir);
}

export function writeDefaultConfig(): void {
  ensureDirSync(getRootDir());
  let configPath = getFilePath('config.json');
  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  getConfig();
}

export function configExists(): boolean {
  return pathExistsSync(getFilePath('config.json'));
}

export function getConfig(): string {
  config = JSON.parse(readFileSync(getFilePath('config.json')).toString());
  return config;
}

export function getConfigAsync(): Promise<any> {
  const configPath = getFilePath('config.json');
  return readJson(configPath);
}

export function saveConfig(cfg: any): void {
  const configPath = getFilePath('config.json');
  writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

export function saveConfigAsync(cfg: any): Promise<void> {
  const configPath = getFilePath('config.json');
  return writeJson(configPath, cfg, { spaces: 2 });
}

export function getCacheFilesFromPattern(pattern: string): any[] {
  let cacheFolder = getFilePath('cache');
  let search = glob.sync(join(cacheFolder, pattern));

  return [].concat(search.map(result => {
    return {
      filename: result.split('/').pop(),
      size: getHumanSize(statSync(result).size)
    };
  }));
}

export function deleteCacheFilesFromPattern(pattern): Promise<void> {
  return new Promise((res, reject) => {
    let cacheFolder = getFilePath('cache');
    let search = glob.sync(join(cacheFolder, pattern));

    Promise.all(search.map(result => remove(result)))
      .then(() => res())
      .catch(err => reject(err));
  });
}

export function randomString(): string {
  return randomBytes(7).toString('hex');
}
