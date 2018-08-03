import { spawn } from 'child_process';
import { Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as dockerode from 'dockerode';
import { Writable } from 'stream';
import { CommandType } from './config';
import { ProcessOutput } from './process';
import * as envVars from './env-variables';
import * as style from 'ansi-styles';
import { platform } from 'os';
import * as commandExists from 'command-exists';
import { demuxStream } from './utils';

export const docker = new dockerode();
const binds = platform() === 'darwin' ? [] : ['/var/run/docker.sock:/var/run/docker.sock'];

export function createContainer(
  name: string,
  image: string,
  envs: envVars.EnvVariables
): Observable<ProcessOutput> {
  return new Observable(observer => {
    docker.createContainer({
      Image: image,
      name: name,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      Env: envVars.serialize(envs) || [],
      Binds: binds,
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
        let msg = style.bold.open + style.yellow.open + '==> ' + style.yellow.close +
          `starting container ` + style.yellow.open + name + ' ' + style.yellow.close +
          `from image ` + style.yellow.open + image + ' ' + style.yellow.close +
          `... ` + style.bold.close;
        observer.next({ type: 'data', data: msg });
        return container;
      })
      .then(container => container.start())
      .then(container => container.inspect())
      .then(info => observer.next({ type: 'containerInfo', data: info }))
      .then(() => observer.next({ type: 'data', data: 'done.\r\n' }))
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

export function dockerExec(
  id: string, cmd: any, env: envVars.EnvVariables = {}
): Observable<any> {
  return new Observable(observer => {
    let exitCode = 255;
    let command;

    // don't show access token on UI
    if (cmd.command.includes('http') && cmd.command.includes('@')) {
      command = cmd.command.replace(/\/\/(.*)@/, '//');
    } else {
      command = cmd.command;
    }

    if (cmd.type === CommandType.store_cache) {
      let msg = style.yellow.open + style.bold.open + '==> storing cache ...' +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });
    } else if (cmd.type === CommandType.restore_cache) {
      let msg = style.yellow.open + style.bold.open + '==> restoring cache ...' +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });
    } else {
      let msg = style.yellow.open + style.bold.open + '==> ' + command +
        style.bold.close + style.yellow.close + '\r\n';
      observer.next({ type: 'data', data: msg });
    }

    let container = docker.getContainer(id);
    let execOptions = {
      Cmd: ['/usr/bin/abstruse-pty', cmd.command],
      Env: envVars.serialize(env),
      AttachStdout: true,
      AttachStderr: true,
      Tty: true
    };

    container.exec(execOptions)
      .then(exe => exe.start())
      .then(stream => {
        let ws = new Writable();
        ws.setDefaultEncoding('utf8');

        ws.on('finish', () => {
          if (cmd.type === CommandType.script) {
            envVars.set(env, 'ABSTRUSE_TEST_RESULT', exitCode);
          }

          observer.next({ type: 'env', data: env });
          observer.next({ type: 'exit', data: exitCode });
          observer.complete();
        });

        ws._write = (chunk, enc, next) => {
          let str = chunk.toString('utf8');

          if (str.includes('[error]')) {
            let splitted = str.split(' ');
            exitCode = Number(splitted[splitted.length - 1]) || 1;
            ws.end();
          } else if (str.includes('[success]')) {
            exitCode = 0;
            ws.end();
          } else {
            if (str.includes('//') && str.includes('@')) {
              str = str.replace(/\/\/(.*)@/, '//');
            }

            let variable =
              Object.keys(env).find(k => env[k].secure && str.indexOf(env[k].value) >= 0);
            if (typeof variable !== 'undefined') {
              str = str.replace(env[variable].value, '******');
            }

            observer.next({ type: 'data', data: str });
          }

          next();
        };

        demuxStream(stream.output, ws);
        stream.output.on('end', () => ws.end());
      })
      .catch(err => observer.error(err));
  });
}

export function dockerPwd(id: string, env: envVars.EnvVariables): Observable<ProcessOutput> {
  return new Observable(observer => {
    dockerExec(id, { type: CommandType.before_install, command: 'pwd' }, env)
      .subscribe(event => {
        if (event && event.data && event.type === 'data') {
          envVars.set(env, 'ABSTRUSE_BUILD_DIR', event.data.replace('\r\n', ''));
        }
      },
      err => observer.error(err),
      () => {
        observer.next({ type: 'env', data: env });
        observer.complete();
      });
  });
}

export function listContainers(): Promise<dockerode.ContainerInfo[]> {
  return docker.listContainers();
}

export function stopAllContainers(): Promise<any[]> {
  return listContainers()
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
    let image = spawn('docker', ['inspect', '--type=image', name]);
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
    commandExists('docker')
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

export function calculateContainerStats(
  container: dockerode.ContainerInfo,
  processes: any
): Promise<any> {
  return docker.getContainer(container.Id).stats({ stream: false })
    .then(stats => {
      const data = stats;
      if (data && data.precpu_stats.system_cpu_usage) {
        const jobId = container.Names[0].split('_')[2] || -1;
        const job = processes.find(p => p.job_id === Number(jobId));
        const debug = job && job.debug || false;
        const statsData = {
          id: container.Id,
          name: container.Names[0].substr(1) || '',
          debug: debug,
          data: data
        };

        return statsData;
      } else {
        return null;
      }
    });
}
