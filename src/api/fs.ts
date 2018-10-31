import { readFile as read, writeFile as write } from 'fs-extra';
import * as rimraf from 'rimraf';

export function readFile(filePath: string): Promise<string> {
  return read(filePath, 'utf8');
}

export function writeFile(filePath: string, data: string): Promise<null> {
  return write(filePath, data, 'utf8');
}

export function writeBufferToFile(filePath: string, data: Buffer): Promise<null> {
  return write(filePath, data);
}

export function writeJsonFile(filePath: string, data: any = {}): Promise<null> {
  return writeFile(filePath, JSON.stringify(data, null, 2));
}

export function rmdir(dirPath: string): Promise<null> {
  return new Promise((resolve, reject) => {
    rimraf(dirPath, err => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
}
