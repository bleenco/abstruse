import { spawn } from 'child_process';
import { Subject, Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as utils from './utils';
const pty = require('node-pty');

export interface TTYMessage {
  id: string;
  type: 'data' | 'error' | 'exit';
  data: string;
  status:  'queued' | 'running' | 'success' | 'failed';
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
  let dockerFile = utils.getFilePath('docker-files');
  let cmd = 'docker';
  let args = ['build', '-t', name, dockerFile];
  return execTty(name, cmd, args);
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
    const kill = spawn('docker', ['rm', id, '-f']);
    kill.on('close', code => {
      observer.next();
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
    let msg: TTYMessage = { id: id, type: 'data', data: null, status: 'queued' };
    observer.next(msg);

    ps.on('data', data => {
      let msg: TTYMessage = { id: id, type: 'data', data: data, status: 'running' };
      observer.next(msg);
    });

    ps.on('error', err => {
      let error: TTYMessage = { id: id, type: 'error', data: err, status: 'failed' };
      observer.next(error);
    });

    ps.on('exit', code => {
      let exitCode: TTYMessage = {
        id: id,
        type: 'exit',
        data: code,
        status: code === 0 ? 'success' : 'failed'
      };

      observer.next(exitCode);
      ps.kill();
      observer.complete();
    });
  });

  let input: any = {
    next(data: any) {
      if (data.action === 'command') {
        ps.write(`${data.message}\r`);
      } else if (data.action === 'resize') {
        ps.resize(data.col, data.row);
      } else if (data.action === 'exit') {
        ps.kill();
      }
    }
  };

  return Subject.create(input, output);
}
