import { join, resolve } from 'path';
import { existsSync, copyFile, ensureDirectory, exists, writeFile } from './fs';
import { readFileSync, writeFileSync } from 'fs';
import { ensureDirSync, statSync, remove, readJson, writeJson } from 'fs-extra';
import * as uuid from 'uuid';
import * as glob from 'glob';
import { homedir } from 'os';
import { getHumanSize } from './utils';
import { randomBytes } from 'crypto';

const defaultConfig = {
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
    .then(() => ensureDirectory(getFilePath('docker/images')))
    .then(() => ensureDirectory(getFilePath('docker/base-images')))
    .then(() => {
      const srcDir = resolve(__dirname, '../../src/files/docker/base-images');
      const destDir = getFilePath('docker/base-images');
      return copyFile(srcDir, destDir);
    })
    .then(() => {
      const avatarDir = resolve(__dirname, '../../src/files/avatars');
      const destDir = getFilePath('avatars');
      return copyFile(avatarDir, destDir);
    })
    .then(() => {
      const avatarDir = resolve(__dirname, '../../src/files/avatars/predefined');
      const destDir = getFilePath('avatars/predefined');
      return copyFile(avatarDir, destDir);
    })
    .then(() => getConfigAsync());
}

export function appReady(): boolean {
  return existsSync(getFilePath('config.json')) && existsSync(getFilePath('docker-essential'));
}

export function getRootDir(): string {
  return join(abstruseHome, 'abstruse');
}

export function getFilePath(relativePath: string): string {
  return join(getRootDir(), relativePath);
}

export function makeAbstruseDir(): Promise<null> {
  const abstruseDir = getRootDir();
  return ensureDirectory(abstruseDir);
}

export function makeCacheDir(): Promise<null> {
  const cachePath = getFilePath('cache');
  return ensureDirectory(cachePath);
}

export function createTempDir(): Promise<string> {
  const tempDir = getFilePath(`cache/${uuid()}`);
  return ensureDirectory(tempDir)
    .then(() => tempDir);
}

export function writeDefaultConfig(): void {
  ensureDirSync(getRootDir());
  const configPath = getFilePath('config.json');
  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  getConfig();
}

export function configExists(): boolean {
  return existsSync(getFilePath('config.json'));
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
  const cacheFolder = getFilePath('cache');
  const search = glob.sync(join(cacheFolder, pattern));

  return [].concat(search.map(result => {
    return {
      filename: result.split('/').pop(),
      size: getHumanSize(statSync(result).size)
    };
  }));
}

export function deleteCacheFilesFromPattern(pattern): Promise<void> {
  return new Promise((res, reject) => {
    const cacheFolder = getFilePath('cache');
    const search = glob.sync(join(cacheFolder, pattern));

    Promise.all(search.map(result => remove(result)))
      .then(() => res())
      .catch(err => reject(err));
  });
}

export function checkSetupDone(): Promise<boolean> {
  return exists(getFilePath('.setupdone'));
}

export function finishSetup(): Promise<void> {
  return writeFile(getFilePath('.setupdone'), new Date().toString());
}

export function randomString(): string {
  return randomBytes(7).toString('hex');
}
