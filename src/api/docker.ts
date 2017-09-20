import { spawn, exec } from 'child_process';
import { Subject, Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as utils from './utils';
import * as dockerode from 'dockerode';
import { Writable } from 'stream';
import { CommandType } from './config';
import { yellow, green, red } from 'chalk';
import { ProcessOutput } from './process';

export const docker = new dockerode();

export function createContainer(
  name: string,
  image: string,
  envs?: string[]
): Observable<ProcessOutput> {
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
      Privileged: true,
      ExposedPorts: {
        '22/tcp': {},
        '5900/tcp': {}
      },
      PortBindings: {
        '22/tcp': [{ HostPort: '' }],
        '5900/tcp': [{ HostPort: '' }]
      }
    } as any)
    .then(container => container.start())
    .then(container => container.inspect())
    .then(info => observer.next({ type: 'containerInfo', data: info }))
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
    } catch (e) {
      observer.complete();
    }

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
            return container.kill()
              .then(() => container.inspect())
              .then(info => info.State.Status);
          } else {
            return Promise.resolve(containerInfo.State.Status);
          }
        })
        .then(status => {
          if (status === 'exited') {
            container.remove();
          } else {
            return Promise.resolve();
          }
        })
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

export function imageExists(name: string): Observable<boolean> {
  return new Observable(observer => {
    const image = spawn('docker', ['inspect', '--type=image', name]);
    image.on('close', code => {
      observer.next(code === 0 ? true : false);
      observer.complete();
    });
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
