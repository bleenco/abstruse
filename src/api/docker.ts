import { spawn } from 'child_process';
import { Subject, Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as utils from './utils';
const pty = require('node-pty');

export interface TTYMessage {
  id: string;
  type: 'data' | 'error' | 'exit';
  data: string;
  status:  'queue' | 'starting' | 'running' | 'stopped' | 'success' | 'errored';
}

export function runInteractive(id: string, image: string): Subject<any> {
  let cmd = 'docker';
  let args = ['run', '-it', '--rm', '--privileged', '--name', id, image];
  return execTty(id, cmd, args);
}

export function imageExists(name: string): Observable<boolean> {
  return new Observable(observer => {
    const image = spawn('docker', ['inspect', '--type=image', name]);
    image.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
  });
}

export function buildImage(name: string): Observable<boolean> {
  return new Observable(observer => {
    const dockerFile = utils.getFilePath('docker-files');
    const build = spawn('docker', ['build', '-t', name, dockerFile]);

    build.stdout.on('data', data => observer.next(data.toString()));

    build.stdout.on('error', err => observer.error(err.toString()));

    build.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
  });
}

export function killAllContainers(): Observable<boolean> {
  return new Observable(observer => {
    const kill = spawn('docker', ['rm', '$(docker ps -a -q)', '-f']);
    kill.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
  });
}

export function killContainer(id: string): Observable<boolean> {
  return new Observable(observer => {
    const kill = spawn('docker', ['rm', id]);
    kill.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
  });
}

export function isDockerRunning(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    const info = spawn('docker', ['info']);
    info.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
  });
}

export function isDockerInstalled(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    const which = spawn('which', ['docker']);
    which.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
  });
}

function execTty(id: string, cmd: string, args: string[] = []): Subject<any> {
  let ps = pty.spawn(cmd, args);

  let output = new Observable((observer: Observer<TTYMessage>) => {
    let msg: TTYMessage = { id: id, type: 'data', data: null, status: 'starting' };
    observer.next(msg);

    ps.on('data', data => {
      let msg: TTYMessage = { id: id, type: 'data', data: data, status: 'running' };
      observer.next(msg);
    });

    ps.on('error', err => {
      let error: TTYMessage = { id: id, type: 'error', data: err, status: 'errored' };
      observer.next(error);
    });

    ps.on('exit', code => {
      let exitCode: TTYMessage = {
        id: id,
        type: 'exit',
        data: code,
        status: code === 0 ? 'success' : 'errored'
      };

      observer.next(exitCode);
      ps.kill('SIGHUP');
      observer.complete();
    });
  });

  let input: any = {
    next(data: any) {
      if (data.action === 'command') {
        ps.write(`${data.message}\r`);
      } else if (data.action === 'resize') {
        ps.resize(data.col, data.row);
      }
    }
  };

  return Subject.create(input, output);
}
