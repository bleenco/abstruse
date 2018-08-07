import * as commandExists from 'command-exists';
import { Observable, Observer } from 'rxjs';
import { spawn } from 'child_process';

export function isSQLiteInstalled(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    commandExists('sqlite3')
      .then(() => {
        observer.next(true);
        observer.complete();
      })
      .catch(() => {
        observer.next(false);
        observer.complete();
      });
  });
}

export function getSQLiteVersion(): Observable<string> {
  return new Observable((observer: Observer<string>) => {
    spawnCmd('sqlite3', ['--version'])
      .then(resp => {
        const version = resp.split(' ')[0].trim();
        observer.next(version);
        observer.complete();
      })
      .catch(err => {
        observer.next(err);
        observer.complete();
      });
  });
}

export function isGitInstalled(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    commandExists('git')
      .then(() => {
        observer.next(true);
        observer.complete();
      })
      .catch(() => {
        observer.next(false);
        observer.complete();
      });
  });
}

export function getGitVersion(): Observable<string> {
  return new Observable((observer: Observer<string>) => {
    spawnCmd('git', ['version'])
      .then(resp => {
        const version = resp.split(' ')[2].trim();
        observer.next(version);
        observer.complete();
      })
      .catch(err => {
        observer.next(err);
        observer.complete();
      });
  });
}

function spawnCmd(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const command = spawn(cmd, args);

    command.stdout.on('data', data => stdout += data.toString());
    command.stderr.on('data', data => stderr += data.toString());
    command.on('close', code => code === 0 ? resolve(stdout) : reject(stderr));
  });
}
