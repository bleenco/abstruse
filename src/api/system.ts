import * as commandExists from 'command-exists';
import { Observable, Observer } from 'rxjs';

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
