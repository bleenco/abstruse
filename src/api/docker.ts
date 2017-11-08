import { spawn, exec } from 'child_process';
import { Subject, Observable, Observer } from 'rxjs';
import * as fs from './fs';
import * as utils from './utils';
import * as dockerode from 'dockerode';
import { Writable } from 'stream';
import { CommandType } from './config';
import { ProcessOutput } from './process';
import { Readable } from 'stream';
import { processes } from './process-manager';
import chalk from 'chalk';

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
    .then(container => container.start())
    .then(container => container.inspect())
    .then(info => observer.next({ type: 'containerInfo', data: info }))
    .then(() => observer.complete())
    .catch(err => {
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
      observer.next({
        type: 'data',
        data: chalk.yellow('==> saving cache ...') + '\r\n' });
    } else if (cmd.type === CommandType.restore_cache) {
      observer.next({
        type: 'data',
        data: chalk.yellow('==> restoring cache ...') + '\r\n' });
    } else {
      observer.next({ type: 'data', data: chalk.yellow('==> ' + command) + '\r\n' });
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
        let str = chunk.toString('utf8');

        if (str.includes('[error]')) {
          const splitted = str.split(' ');
          exitCode = splitted[splitted.length - 1] || 1;
          ws.end();
        } else if (str.includes('[success]')) {
          exitCode = 0;
          ws.end();
        } else if (!str.includes('/usr/bin/abstruse \'' + cmd.command) && !str.startsWith('>')) {
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
            return container.kill().then(() => container.remove());
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

export function getContainersStats(): Observable<any> {
  return new Observable(observer => {
    Observable
      .interval(2000)
      .timeInterval()
      .mergeMap(() => {
        return docker.listContainers().then(containers => {
          return Promise.all(containers.map(container => {
            return docker.getContainer(container.Id).stats().then((stream: any) => {
              let json = '';
              return new Promise(resolve => {
                stream.on('data', buf => {
                  let rawJson = json + buf.toString();
                  try {
                    let data = JSON.parse(rawJson);

                    if (data && data.precpu_stats.system_cpu_usage) {
                      const jobId = container.Names[0].split('_')[2] || -1;
                      const job = processes.find(p => p.job_id === Number(jobId));
                      let debug = false;
                      if (job) {
                        debug = job.debug || false;
                      }

                      const stats = {
                        id: container.Id,
                        name: container.Names[0].substr(1) || '',
                        cpu: getCpuData(data),
                        network: getNetworkData(data),
                        memory: getMemory(data),
                        debug: debug
                      };

                      stream.destroy();
                      resolve(stats);
                    }
                  } catch (e) {
                    json = rawJson;
                  }
                });
              });
            });
          })).then(stats => stats);
        });
      })
      .map(stats => observer.next({ type: 'containersStats', data: stats }))
      .subscribe();
  }).share();
}

function getCpuData(json: any): { usage: string, cores: number } {
  const postCpuStats = json.cpu_stats;
  const preCpuStats = json.precpu_stats;
  const total = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage;
  const curr = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage;
  const perc = isNaN(total / (total + curr) * 100) ? 0 : total / (total + curr) * 100;

  return {
    usage: perc.toFixed(2) + '%',
    cores: postCpuStats.online_cpus
  };
}

function getNetworkData(json: any): { in: string, out: string } {
  if (json.networks && json.networks['eth0']) {
    const net = json.networks['eth0'];
    return {
      in: utils.getHumanSize(net.rx_bytes),
      out: utils.getHumanSize(net.tx_bytes)
    };
  } else {
    return { in: '0', out: '0' };
  }
}

function getMemory(json: any): { total: string, usage: string, percent: string } {
  const memStats = json.memory_stats;
  let memory = memStats.usage / memStats.limit * 100;
  memory = isNaN(memory) ? 0 : memory;
  return {
    total: utils.getHumanSize(memStats.limit),
    usage: utils.getHumanSize(memStats.usage),
    percent: memory.toFixed(2) + '%'
  };
}
