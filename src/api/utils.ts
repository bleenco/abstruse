import { homedir } from 'os';
import { join, resolve } from 'path';
import {
  existsSync,
  exists,
  copyFile,
  writeJsonFile,
  readJsonFile,
  ensureDirectory,
  writeFile
} from './fs';
import { readFileSync, writeFileSync } from 'fs';
import { ensureDirSync, statSync, remove } from 'fs-extra';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';
import * as request from 'request';
import * as temp from 'temp';
import * as nodeRsa from 'node-rsa';
import * as glob from 'glob';
import { CommandType, CommandTypePriority } from './config';
import { JobProcess } from './process-manager';

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

export let abstruseHome = null;
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
      const srcDir = resolve(__dirname, '../../src/files/docker-essential');
      const destDir = getFilePath('docker-essential');
      return copyFile(srcDir, destDir);
    })
    .then(() => {
      const avatarDir = resolve(__dirname, '../../src/files/avatars');
      const destDir = getFilePath('avatars');
      return copyFile(avatarDir, destDir);
    })
    .then(() => getConfig());
}

export function appReady(): boolean {
  return existsSync(getFilePath('config.json')) && existsSync(getFilePath('docker-essential'));
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
  getConfig();
}

export function configExists(): boolean {
  return existsSync(getFilePath('config.json'));
}

export function getConfig(): string {
  config = JSON.parse(readFileSync(getFilePath('config.json')).toString());
  return config;
}

export function getAbstruseVersion(): string {
  try {
    const pkgJson = JSON.parse(readFileSync(resolve(__dirname, '../../package.json')).toString());
    return pkgJson.version;
  } catch (e) {
    console.log(e);
    return 'unknown';
  }
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
  return new Promise((resolve, reject) => {
    const cacheFolder = getFilePath('cache');
    const search = glob.sync(join(cacheFolder, pattern));

    Promise.all(search.map(result => remove(result)))
      .then(() => resolve())
      .catch(err => reject(err));
  });
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

export function generateBadgeHtml(status: string): string {
  let background = null;
  if (status === 'failing') {
    background = '#f03e3e';
  } else if (status === 'running') {
    background = '#ffd43b';
  } else if (status === 'queued') {
    background = '#ffd43b';
  } else if (status === 'unknown') {
    status = 'none';
    background = '#3A7EE1';
  } else {
    background = '#39B54A';
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="20" style="shape-rendering:
      geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd;
      clip-rule:evenodd">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"></stop>
        <stop offset="1" stop-opacity=".1"></stop>
      </linearGradient>
      <mask id="a">
        <rect width="100" height="20" rx="3" fill="#fff"></rect>
      </mask>
      <g mask="url(#a)">
        <path fill="#333" d="M0 0h50v20H0z"></path>
        <path fill="${background}" d="M50 0h50v20H50z"></path>
        <path fill="url(#b)" d="M0 0h100v20H0z"></path>
      </g>
      <g fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="10">
        <text x="4" y="15" fill="#010101" fill-opacity=".3">abstruse</text>
        <text x="4" y="14">abstruse</text>
        <text x="53" y="15" fill="#010101" fill-opacity=".3">${status}</text>
        <text x="53" y="14">${status}</text>
      </g>
    </svg>
  `;
}

export function getBitBucketAccessToken(clientCredentials: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let options = {
        url: `https://${clientCredentials}@bitbucket.org/site/oauth2/access_token`,
        method: 'POST',
        formData: { grant_type: 'client_credentials' }
      };

      request(options, (err, response, body) => {
        if (err) {
          reject(err);
        } else {
          if (response.statusCode < 300 && response.statusCode >= 200) {
            resolve(JSON.parse(body));
          } else {
            reject({
              statusCode: response.statusCode,
              response: body
            });
          }
        }
      });
    });
}

export function prepareCommands(proc: JobProcess, allowed: CommandType[]): any {
  let commands = proc.commands.filter(command => allowed.findIndex(c => c === command.type) !== -1);
  return commands.sort((a, b) => {
    if (CommandTypePriority[a.type] > CommandTypePriority[b.type]) {
      return 1;
    } else if (CommandTypePriority[a.type] < CommandTypePriority[b.type]) {
      return -1;
    }
    return proc.commands.indexOf(a) - proc.commands.indexOf(b);
  });
}
