import { homedir } from 'os';
import { join, resolve } from 'path';
import { existsSync, exists, copyFile, writeJsonFile, readJsonFile, ensureDirectory } from './fs';
import { readFileSync, writeFileSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';
import * as request from 'request';

const defaultConfig = {
  url: null,
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

export function generateBadgeHtml(status: string): string {
  let background = null;
  if (status === 'failing') {
    background = '#f03e3e';
  } else if (status === 'running') {
    background = '#ffd43b';
  } else if (status === 'queued') {
    background = '#ffd43b';
  } else if (status === 'unknown') {
    background = '#3A7EE1';
  } else {
    background = '#39B54A';
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="110" height="20" style="shape-rendering:
      geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd;
      clip-rule:evenodd">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <mask id="a">
        <rect width="110" height="20" rx="3" fill="#fff"/>
      </mask>
      <g mask="url(#a)">
        <path fill="#333" d="M0 0h53v20H0z"/>
        <path fill="` + background + `" d="M53 0h75v20H53z"/>
        <path fill="url(#b)" d="M0 0h97v20H0z"/>
      </g>
      <g transform="matrix(0.27,0,0,0.27,3,2.7)">
        <circle fill-rule="evenodd" clip-rule="evenodd" fill="none" stroke="#FFFFFF"
          stroke-width="3px" stroke-linecap="round" stroke-linejoin="round"
          stroke-miterlimit="10" cx="27" cy="27" r="26"/>
        <path fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF"
d="M24.83,25.84c0.01,1.54,0.01,3.08,0.01,4.63
c0.02,0.96,0.18,1.99,0.79,2.76c0.69,0.88,1.83,1.27,2.9,1.35c1.16,0.06,
2.4,0.07,3.44-0.53c1-0.57,1.53-1.7,
1.66-2.81c0.19-1.26,0.12-2.62-0.57-3.73c-0.69-1.1-2.03-1.66-3.28-1.67H24.83z
M19.18,11.57c1.1-1.1,2.99-1.24,4.25-0.33c0.88,0.6,
1.48,1.65,1.41,2.73v4.65c-0.01,0.19,0,0.53,0.1,0.53c1.74-0.01,3.48,0,
5.21-0.01c2.04-0.06,4.11,0.5,5.85,1.57c1.48,0.92,2.69,2.28,3.41,3.88c0.79,
1.71,1.04,3.61,1.01,5.49c0,2.09-0.32,4.24-1.3,6.12c-0.82,
1.65-2.19,3.01-3.84,3.84c-1.78,0.92-3.78,1.29-5.77,
1.36c-2.3-0.04-4.68-0.41-6.66-1.67c-1.92-1.19-3.2-3.18-3.85-5.29c-0.77-2.47-0.85-5.08-0.85-7.64
c-0.02-0.32,0.12-0.66-0.02-0.98c-0.75-0.04-1.5,
0.07-2.22-0.11c-1.04-0.27-1.93-1.1-2.29-2.12c-0.32-0.89-0.24-1.92,0.21-2.75
c0.46-0.82,1.25-1.45,2.16-1.67c0.7-0.06,1.41-0.01,2.1-0.02c-0.01-1.6,
0-3.2-0.01-4.81C18.09,13.33,18.42,12.27,19.18,11.57z"/>
      </g>
      <g fill="#fff" font-family="Verdana,Geneva,sans-serif" font-size="9">
        <text x="22" y="15" fill="#010101" fill-opacity=".3">build</text>
        <text x="22" y="14">build</text>
        <text x="58" y="15" fill="#010101" fill-opacity=".3">` + status + `</text>
        <text x="58" y="14">` + status + `</text>
      </g>
    </svg>
  `;
}
