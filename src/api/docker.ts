import { spawn } from 'child_process';
import { Subject, Observable, Observer } from 'rxjs';
const pty = require('node-pty');

export interface TTYMessage {
  type: 'data' | 'error' | 'exit';
  message: string;
}

export function runInteractive(name: string, image: string): Subject<any> {
  let cmd = 'docker';
  let args = ['run', '-it', '--rm', '--name', name, image];
  return execTty(cmd, args);
}

export function isDockerRunning(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    const info = spawn('docker', ['info']);
    info.on('close', code => {
      if (code === 0) {
        observer.next(true);
      } else {
        observer.next(false);
      }

      observer.complete();
    });
  });
}

export function isDockerInstalled(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    const which = spawn('which', ['docker']);
    which.on('close', code => {
      if (code === 0) {
        observer.next(true);
      } else {
        observer.next(false);
      }

      observer.complete();
    });
  });
}

function execTty(cmd: string, args: string[] = []): Subject<any> {
  let ps = pty.spawn(cmd, args);

  let output = new Observable((observer: Observer<TTYMessage>) => {
    ps.on('data', data => {
      let msg: TTYMessage = { type: 'data', message: data };
      observer.next(msg);
    });

    ps.on('error', err => {
      let error: TTYMessage = { type: 'error', message: err };
      observer.next(error);
    });

    ps.on('exit', code => {
      let exitCode: TTYMessage = { type: 'exit', message: code };
      observer.next(exitCode);
      observer.complete();
    });
  });

  let input: any = {
    next(data: any) {
      if (data.action === 'command') {
        ps.write(`${data.message}\n`);
      } else if (data.action === 'resize') {
        ps.resize(data.col, data.row);
      }
    }
  };

  return Subject.create(input, output);
}
