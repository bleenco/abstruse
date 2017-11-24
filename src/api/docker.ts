import { spawn, exec } from 'child_process';
import { Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as dockerode from 'dockerode';
import { Writable } from 'stream';
import { CommandType } from './config';
import { ProcessOutput } from './process';
import chalk from 'chalk';
import * as style from 'ansi-styles';

export const docker = new dockerode();

export function createContainer(
  name: string,
  image: string,
  envs: string[]
): Observable<ProcessOutput> {
  return new Observable(observer => {
    docker.createContainer({
      Image: image,
      name: name,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
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
    .then(container => {
      const msg = style.bold.open + style.yellow.open + '==> ' + style.yellow.close +
        `starting container ` +  style.yellow.open + name + ' ' + style.yellow.close +
        `from image ` + style.yellow.open + image + ' ' + style.yellow.close +
        `... ` + style.bold.close;
      observer.next({ type: 'data', data: msg });
      return container;
    })
    .then(container => container.start())
    .then(container => container.inspect())
    .then(info => observer.next({ type: 'containerInfo', data: info }))
    .then(() => {
      observer.next({ type: 'data', data: 'done.\r\n' });
    })
    .then(() => observer.complete())
    .catch(err => {
      observer.next({ type: 'data', data: 'error.\r\n' });
      observer.next({ type: 'containerError', data: err });
      observer.error(err);
    });
  });
}

export function startContainer(id: string): Promise<dockerode.Container> {
  return docker.getContainer(id).start();
}

export function attachExec(id: string, cmd: any): Observable<any> {
  return new Observable(observer => {
    const startTime = new Date().getTime();
    let exitCode = 255;
    let command;

    // don't show access token on UI
    if (cmd.command.includes('http') && cmd.command.includes('@')) {
      command = cmd.command.replace(/\/\/(.*)@/, '//');
    } else {
      command = cmd.command;
    }

    if (cmd.type === CommandType.store_cache) {
      const msg = style.yellow.open + style.bold.open + '==> storing cache ...' +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });
    } else if (cmd.type === CommandType.restore_cache) {
      const msg = style.yellow.open + style.bold.open + '==> restoring cache ...' +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });
    } else {
      const msg = style.yellow.open + style.bold.open + '==> ' + command +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });
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
        observer.next({ type: 'exit', data: exitCode });
        observer.complete();
      });

      ws._write = (chunk, enc, next) => {
        let str = chunk.toString();

        if (str.includes('[error]')) {
          const splitted = str.split(' ');
          exitCode = splitted[splitted.length - 1] || 1;
          ws.end();
        } else if (str.includes('[success]')) {
          exitCode = 0;
          ws.end();
        } else if (!str.includes('/usr/bin/abstruse') && !str.startsWith('>') &&
          !str.startsWith('abstruse@')) {
          if (str.includes('//') && str.includes('@')) {
            str = str.replace(/\/\/(.*)@/, '//');
          }

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
          if (containerInfo.State.Status === 'running') {
            return container.kill();
          } else {
            return Promise.resolve();
          }
        })
        .then(() => removeContainer(id))
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
  return new Promise(resolve => {
    try {
      let container = docker.getContainer(id);

      return container.inspect()
        .then(containerInfo => container.remove())
        .then(() => resolve())
        .catch(() => resolve());
    } catch {
      resolve();
    }
  });
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
