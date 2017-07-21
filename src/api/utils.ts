import { homedir } from 'os';
import { join, resolve } from 'path';
import { existsSync, exists, copyFile, writeJsonFile, readJsonFile, ensureDirectory } from './fs';
import { readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';
import * as request from 'request';

let home = `${homedir()}/.abstruse`;
const defaultConfig = {
  secret: 'thisIsSecret',
  port: 6500,
  wsport: 6501,
  concurrency: 10,
  ssl: false,
  sslcert: null,
  sslkey: null,
  db: {
    client: 'sqlite3',
    connection: {
      filename: './abstruse.sqlite'
    },
    useNullAsDefault: true
  }
};

export let abstruseHome = null;

export function setHome(dirPath: string): void {
  abstruseHome = dirPath;
}

export function initSetup(): Promise<null> {
  return makeAbstruseDir()
    .then(() => makeCacheDir())
    .then(() => {
      const srcDir = resolve(__dirname, '../../src/files');
      const destDir = getFilePath('docker-files');
      return copyFile(srcDir, destDir);
    })
    .then(() => {
      const avatarDir = resolve(__dirname, '../../src/avatars');
      const destDir = getFilePath('avatars');
      return copyFile(avatarDir, destDir);
    });
}

export function appReady(): boolean {
  return existsSync(getFilePath('docker-images')) && existsSync(getFilePath('docker-files'));
}

export function getRootDir(): string {
  return join(abstruseHome, '.abstruse');
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
}

export function configExists(): boolean {
  return existsSync(getFilePath('config.json'));
}

export function getConfig(): string {
  return JSON.parse(readFileSync(getFilePath('config.json')).toString());
}

export function getHumanSize(bytes: number, decimals = 2): string {
  if (!bytes) {
    return '0 Bytes';
  }

  const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1000;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(7);
}

export function getHttpJsonResponse(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      headers: {
        'User-Agent': 'request'
      }
    };

    request(options, (err, resp, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}
