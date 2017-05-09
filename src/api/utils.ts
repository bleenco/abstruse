import { homedir } from 'os';
import { join, resolve } from 'path';
import { existsSync, exists, copyFile, writeJsonFile } from './fs';
import { readFileSync } from 'fs';
import { Observable } from 'rxjs';

export function initSetup(): Promise<null> {
  const srcDir = resolve(__dirname, '../../src/files');
  const destDir = getFilePath('docker-files');

  return copyFile(srcDir, destDir);
}

export function writeDefaultConfig(): Observable<null> {
  return new Observable(observer => {
    const configPath = getFilePath('config.json');
    const config = {
      port: 6500,
      wsport: 6501,
      db: {
        client: 'sqlite3',
        connection: {
          filename: './abstruse.sqlite'
        },
        useNullAsDefault: true
      }
    };

    exists(configPath).then(e => {
      if (!e) {
        writeJsonFile(configPath, config).then(() => {
          observer.complete();
        });
      } else {
        observer.complete();
      }
    });
  });
}

export function appReady(): boolean {
  return existsSync(getFilePath('docker-images')) && existsSync(getFilePath('docker-files'));
}

export function getRootDir(): string {
  return join(homedir(), '.abstruse');
}

export function getFilePath(relativePath: string): string {
  return join(getRootDir(), relativePath);
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
