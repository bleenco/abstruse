import * as fs from 'fs';
import * as fse from 'fs-extra';
import { dirname } from 'path';

export function copyFile(srcPath: string, destPath: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fse.copy(srcPath, destPath, err => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
}

export function writeFile(filePath: string, data: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf8', (err: NodeJS.ErrnoException) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function writeBufferToFile(filePath: string, data: Buffer): Promise<null> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err: NodeJS.ErrnoException) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function ensureDirectory(dirPath: string): Promise<null> {
  return new Promise((resolve, reject) => {
    fse.ensureDir(dirPath, (err: Error) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

export function readDir(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err: NodeJS.ErrnoException, files: string[]) => {
      if (err) {
        reject(err);
      }

      resolve(files);
    });
  });
}

export function writeJsonFile(filePath: string, data: any = {}): Promise<null> {
  return writeFile(filePath, JSON.stringify(data, null, 2));
}

export function readJsonFile(filePath: string): Promise<any> {
  return readFile(filePath).then(data => JSON.parse(data));
}

export function existsSync(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function exists(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.exists(filePath, (exists: boolean) => resolve(exists));
  });
}
