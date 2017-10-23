import { spawn } from 'child_process';
import { Observable, Observer } from 'rxjs';

export function isSQLiteInstalled(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    const sqlite = spawn('which', ['sqlite3']);
    sqlite.on('close', code => {
      if (code === 0) {
        observer.next(true);
      } else {
        observer.next(false);
      }

      observer.complete();
    });
  });
}

export function isGitInstalled(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    const git = spawn('which', ['git']);
    git.on('close', code => {
      if (code === 0) {
        observer.next(true);
      } else {
        observer.next(false);
      }

      observer.complete();
    });
  });
}
