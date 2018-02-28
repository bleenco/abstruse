import * as path from 'path';
import { existsSync, copyFile, ensureDirectory } from './fs';
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { ensureDirSync, statSync, remove } from 'fs-extra';
import * as uuid from 'uuid';
import * as temp from 'temp';
import * as glob from 'glob';
import { getHumanSize } from './utils';

const defaultConfig = {
  url: null,
  secret: 'thisIsSecret',
  jwtSecret: 'abstruseSecret4321!!',
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

export let abstruseHome = `${homedir()}/.abstruse`;
export let config: any = defaultConfig;

export function setHome(dirPath: string): void {
  abstruseHome = dirPath;
}

export function initSetup(): Promise<string> {
  return makeAbstruseDir()
    .then(() => makeCacheDir())
    .then(() => ensureDirectory(getFilePath('images')))
    .then(() => ensureDirectory(getFilePath('base-images')))
    .then(() => {
      const srcDir = path.resolve(__dirname, '../../src/files/docker-essential');
      const destDir = getFilePath('docker-essential');
      return copyFile(srcDir, destDir);
    })
    .then(() => {
      const avatarDir = path.resolve(__dirname, '../../src/files/avatars');
      const destDir = getFilePath('avatars');
      return copyFile(avatarDir, destDir);
    })
    .then(() => getConfig());
}

export function appReady(): boolean {
  return existsSync(getFilePath('config.json')) && existsSync(getFilePath('docker-essential'));
}

export function getRootDir(): string {
  return path.join(abstruseHome, '.abstruse');
}

export function getFilePath(relativePath: string): string {
  return path.join(getRootDir(), relativePath);
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

export function getCacheFilesFromPattern(pattern: string): any[] {
  const cacheFolder = getFilePath('cache');
  const search = glob.sync(path.join(cacheFolder, pattern));

  return [].concat(search.map(result => {
    return {
      filename: result.split('/').pop(),
      size: getHumanSize(statSync(result).size)
    };
  }));
}

export function deleteCacheFilesFromPattern(pattern): Promise<void> {
  return new Promise((resolve, reject) => {
    const cacheFolder = getFilePath('cache');
    const search = glob.sync(path.join(cacheFolder, pattern));

    Promise.all(search.map(result => remove(result)))
      .then(() => resolve())
      .catch(err => reject(err));
  });
}
