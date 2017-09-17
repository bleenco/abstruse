import { spawn, exec } from 'child_process';
import { Subject, Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as utils from './utils';
const pty = require('node-pty');
import * as dockerode from 'dockerode';
import { Writable } from 'stream';
import { CommandType } from './config';
import { yellow, green, red } from 'chalk';

export const docker = new dockerode();

export function createContainer(
  name: string,
  image: string,
  envs?: string[]
): Observable<dockerode.Container> {
  return new Observable(observer => {
    docker.createContainer({
      Image: image,
      name: name,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      Cmd: ['/bin/bash'],
      Env: envs || [],
      Binds: ['/var/run/docker.sock:/var/run/docker.sock'],
      Privileged: true
    } as any)
    .then(container => container.start())
    .then(() => observer.complete())
    .catch(err => observer.error(err));
  });
}

export function startContainer(id: string): Promise<dockerode.Container> {
  return docker.getContainer(id).start();
}

export function attachExec(id: string, cmd: any): Observable<any> {
  return new Observable(observer => {
    const startTime = new Date().getTime();
    let exitCode = 255;

    // don't show access token on UI
    if (cmd.command.includes('http') && cmd.command.includes('@')) {
      cmd.command = cmd.command.replace(/\/\/(.*)@/, '//');
    }

    if (cmd.type === CommandType.store_cache) {
      observer.next({ type: 'data', data: yellow('==> saving cache ...') + '\r' });
    } else if (cmd.type === CommandType.restore_cache) {
      observer.next({ type: 'data', data: yellow('==> restoring cache ...') + '\r' });
    } else {
      observer.next({ type: 'data', data: yellow('==> ' + cmd.command) + '\r' });
    }

    const container = docker.getContainer(id);
    const attachOpts = {
      stream: true,
      stdin: true,
      stdout: true,
      stderr: true
    };

    container.attach(attachOpts, (err, stream: any) => {
      if (err) {
        observer.error(err);
      }

      const ws = new Writable();

      ws.on('finish', () => {
        const duration = new Date().getTime() - startTime;
        observer.next({ type: 'data', data: `[exectime]: ${duration}` });
        observer.next({ type: 'exit', data: exitCode });
        observer.complete();
      });

      ws._write = (chunk, enc, next) => {
        const str = chunk.toString();

        if (str.includes('[error]')) {
          const splitted = str.split(' ');
          exitCode = splitted[splitted.length - 1] || 1;
          ws.end();
        } else if (str.includes('[success]')) {
          exitCode = 0;
          ws.end();
        } else if (!str.includes('/usr/bin/abstruse') && !str.startsWith('>')) {
          observer.next({ type: 'data', data: str });
        }

        next();
      };

      stream.pipe(ws);
      stream.write('/usr/bin/abstruse \'' + cmd.command + '\'\r');
    });
  });
}

export function stopAllContainers(): Promise<any[]> {
  return docker.listContainers()
    .then(containers => {
      return Promise.all(containers.map(containerInfo => {
        return docker.getContainer(containerInfo.Id).stop();
      }));
    });
}

export function stopContainer(id: string): Observable<any> {
  return new Observable(observer => {
    let container = null;
    try {
      container = docker.getContainer(id);
    } catch (e) { }

    if (container) {
      try {
        container.inspect()
          .then(containerInfo => {
            if (containerInfo.State.Running) {
              container.stop()
                .then(() => container.remove())
                .then(() => observer.next(container))
                .then(() => observer.complete())
                .catch(err => observer.complete());
            } else {
              container.remove()
                .then(() => observer.next(container))
                .then(() => observer.complete())
                .catch(err => observer.complete());
            }
          }).catch(err => observer.complete());
      } catch (e) {
        observer.next();
        observer.complete();
      }
    } else {
      observer.next();
      observer.complete();
    }
  });
}

export function killContainer(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let container = null;
    try {
      container = docker.getContainer(id);
      container.inspect()
        .then(containerInfo => {
          if (containerInfo.State.Running) {
            return container.kill();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => container.remove())
        .then(() => resolve())
        .catch(err => {
          if (err.statusCode === 404) {
            resolve();
          } else {
            console.error(err);
          }
        });
    } catch (e) {
      resolve();
    }
  });
}

export function removeContainer(id: string): Promise<void> {
  return docker.getContainer(id).remove();
}

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
  let args = ['build', '--compress=true', '-m=2048M', '-t', name, dockerFile];
  return execTty(name, cmd, args);
}

export function killAllContainers(): Promise<void> {
  return new Promise(resolve => {
    exec('docker rm $(docker ps -a -q) -f', (err, stdout, stderr) => resolve());
  });
}

export function isDockerRunning(): Observable<boolean> {
  return new Observable((observer: Observer<boolean>) => {
    fs.exists('/var/run/docker.sock')
      .then(isRunning => {
        observer.next(isRunning);
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

    let buildMsg: TTYMessage = {
      id: id,
      type: 'data',
      data: '==> Build Docker Image',
      status: 'running'
    };

    observer.next(buildMsg);

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
