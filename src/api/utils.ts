import { homedir } from 'os';
import { join, resolve } from 'path';
import { existsSync, copyFile } from './fs';
import { readFileSync, writeFileSync } from 'fs';

export function initSetup(): void {
  const srcDir = resolve(__dirname, '../../src/files');
  const destDir = getRootDir();

  copyFile(join(srcDir, 'xvfb'), join(destDir, 'docker-files', 'xvfb'));
  copyFile(join(srcDir, 'Dockerfile'), join(destDir, 'docker-files', 'Dockerfile'));
}

export function writeDefaultConfig(): void {
  const config = {
    port: 6500,
    wsport: 6501,
    dbclient: 'sqlite3',
    connection: {
      filename: './abstruse.sqlite'
    }
  };

  if (!existsSync(getFilePath('config.json'))) {
    try {
      writeFileSync(getFilePath('config.json'), config);
    } catch (e) {
      console.error(e);
    }
  }
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
  return readFileSync(getFilePath('config.json')).toString();
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
