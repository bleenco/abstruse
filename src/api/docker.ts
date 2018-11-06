import * as style from 'ansi-styles';
import { spawn } from 'child_process';
import * as commandExists from 'command-exists';
import * as dockerode from 'dockerode';
import { pathExists } from 'fs-extra';
import { homedir, platform } from 'os';
import { Observable, Observer } from 'rxjs';
import { Writable } from 'stream';

import { CommandType } from './config';
import * as envVars from './env-variables';
import { ProcessOutput } from './process';
import { demuxStream } from './utils';

export const docker = new dockerode();
const binds = [
  `${homedir()}/.cache/yarn/v2:/usr/local/share/.cache/yarn/v2`,
  ...(platform() === 'darwin' ? [] : ['/var/run/docker.sock:/var/run/docker.sock'])
];

export function createContainer(
  name: string,
  image: string,
  envs: envVars.EnvVariables
): Observable<ProcessOutput> {
  return new Observable(observer => {

    // wrap in async function to avoid returning invalid type to Observable
    const create = async () => {
      try {

        const container = await docker.createContainer({
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
        });

        let msg = style.bold.open + style.yellow.open + '==> ' + style.yellow.close +
          `starting container ` + style.yellow.open + name + ' ' + style.yellow.close +
          `from image ` + style.yellow.open + image + ' ' + style.yellow.close +
          `... ` + style.bold.close;

        observer.next({ type: 'data', data: msg });

        await container.start();

        const info = await container.inspect();
        observer.next({ type: 'containerInfo', data: info });
        observer.next({ type: 'data', data: 'done.\r\n' });
        observer.complete();
      } catch (err) {
        observer.next({ type: 'data', data: 'error.\r\n' });
        observer.next({ type: 'containerError', data: err });
        observer.error(err);
      }
    };

    create();
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

        ws._write = (chunk, _enc, next) => {
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

export async function stopAllContainers(): Promise<any[]> {
  const containers = await listContainers();
  return Promise.all(containers.map(containerInfo => {
    return docker.getContainer(containerInfo.Id).stop();
  }));
}

export function stopContainer(id: string): Observable<any> {
  return new Observable(observer => {

    // wrap in async function to avoid returning invalid type to Observable
    const stop = async () => {
      try {
        const container = docker.getContainer(id);
        const { State } = await container.inspect();

        if (State.Running) {
          await container.stop();
          await container.remove();
          observer.next(container);
          observer.complete();
        } else {
          await container.remove();
          observer.next(container);
          observer.complete();
        }
      } catch (e) {
        observer.next();
        observer.complete();
      }
    };

    stop();
  });
}

export async function killContainer(id: string): Promise<void> {
  try {
    const container = docker.getContainer(id);
    const { State } = await container.inspect();
    if (State.Status === 'running') {
      await container.kill();
    }
    await removeContainer(id);
  } catch (err) {
    if (err.statusCode !== 404) {
      console.error(err);
    }
  }
}

export async function removeContainer(id: string): Promise<void> {
  try {
    return docker.getContainer(id).remove();
  } catch {
    return;
  }
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
    pathExists('/var/run/docker.sock')
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
