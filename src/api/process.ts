import * as docker from './docker';
import { PtyInstance } from './pty';
import * as child_process from 'child_process';
import { generateRandomId, getFilePath } from './utils';
import { getRepositoryByBuildId } from './db/repository';
import { Observable } from 'rxjs';
import { green, red, bold, yellow, blue, cyan } from 'chalk';
import { CommandType, Command } from './config';
import { JobProcess } from './process-manager';
const nodePty = require('node-pty');

export interface Job {
  status: 'queued' | 'running' | 'success' | 'failed';
  type: 'setup' | 'build';
  pty: any;
  log: string[];
  exitStatus: number;
}

export interface SpawnedProcessOutput {
  stdout: string;
  stderr: string;
  exit: number;
}

export interface ProcessOutput {
  type: 'data' | 'exit' | 'container' | 'exposed port';
  data: string;
}

export function startBuildProcess(
  proc: JobProcess,
  image: string,
  variables: string[],
  jobTimeout: number,
  idleTimeout: number
): Observable<ProcessOutput> {
  return new Observable(observer => {
    const name = 'abstruse_' + proc.build_id + '_' + proc.job_id;
    const envs = proc.commands.filter(cmd => cmd.command.startsWith('export'))
      .map(cmd => cmd.command.replace('export', '-e'))
      .reduce((acc, curr) => acc.concat(curr.split(' ')), [])
      .concat(proc.env.reduce((acc, curr) => acc.concat(['-e', curr]), []))
      .concat(variables.reduce((acc, curr) => acc.concat(['-e', curr]), []));

    proc.commands = proc.commands.filter(cmd => !cmd.command.startsWith('export'));

    const gitCommands = proc.commands.filter(command => command.type === CommandType.git);
    const installCommands = proc.commands.filter(command => {
      return command.type === CommandType.before_install || command.type === CommandType.install;
    });
    const scriptCommands = proc.commands.filter(command => {
      return command.type === CommandType.before_script || command.type === CommandType.script ||
        command.type === CommandType.after_success || command.type === CommandType.after_failure;
    });
    const deployCommands = proc.commands.filter(command => {
      return command.type === CommandType.before_deploy || command.type === CommandType.deploy ||
        command.type === CommandType.after_deploy || command.type === CommandType.after_script;
    });

    let restoreCache: Observable<any> = Observable.empty();
    let saveCache: Observable<any> = Observable.empty();
    if (proc.repo_name && proc.branch && proc.cache) {
      let cacheFile = `cache_${proc.repo_name.replace('/', '-')}_${proc.branch}.tar.bz2`;
      let cacheHostPath = getFilePath(`cache/${cacheFile}`);
      let cacheContainerPath = `/home/abstruse/${cacheFile}`;
      let copyRestoreCmd = [
        `if [ -e ${cacheHostPath} ];`,
        `then docker cp ${cacheHostPath} ${name}:/home/abstruse`,
        `; fi`
      ].join(' ');
      let restoreCmd = [
        `if [ -e /home/abstruse/${cacheFile} ];`,
        `then tar xjf /home/abstruse/${cacheFile} -C .`,
        `; fi`
      ].join(' ');

      restoreCache = Observable.concat(...[
        executeOutsideContainer(copyRestoreCmd),
        executeInContainer(name, { command: restoreCmd, type: CommandType.restore_cache })
      ]);

      let tarCmd = [
        `if [ ! -e /home/abstruse/${cacheFile} ];`,
        `then tar cjSf /home/abstruse/${cacheFile} ${proc.cache.join(' ')}`,
        `; fi`
      ].join(' ');
      let saveTarCmd = `docker cp ${name}:/home/abstruse/${cacheFile} ${cacheHostPath}`;

      saveCache = Observable.concat(...[
        executeInContainer(name, { command: tarCmd, type: CommandType.store_cache }),
        executeOutsideContainer(saveTarCmd)
      ]);
    }

    let debug: Observable<any> = Observable.empty();
    if (proc.sshAndVnc) {
      const ssh = `sudo /etc/init.d/ssh start`;
      const xvfb = [
        'export DISPLAY=:99 &&',
        'sudo /etc/init.d/xvfb start &&',
        'sleep 3 &&',
        'sudo /etc/init.d/openbox start'
      ].join(' ');
      const vnc = [
        'x11vnc -xkb -noxrecord -noxfixes -noxdamage',
        '-display :99 -forever -bg -rfbauth /etc/x11vnc.pass',
        '-rfbport 5900'
      ].join(' ');

      debug = Observable.concat(...[
        executeInContainer(name, { command: ssh, type: CommandType.before_install }),
        getContainerExposedPort(name, 22),
        executeInContainer(name, { command: xvfb, type: CommandType.before_install }),
        executeInContainer(name, { command: vnc, type: CommandType.before_install }),
        getContainerExposedPort(name, 5900)
      ]);
    }

    const sub = startContainer(name, image, envs)
      .concat(debug)
      // .concat(...proc.commands.map(cmd => executeInContainer(name, cmd)))
      .concat(...gitCommands.map(cmd => executeInContainer(name, cmd)))
      .concat(...[restoreCache])
      .concat(...installCommands.map(cmd => executeInContainer(name, cmd)))
      .concat(...[saveCache])
      .concat(...scriptCommands.map(cmd => executeInContainer(name, cmd)))
      .concat(...deployCommands.map(cmd => executeInContainer(name, cmd)))
      .timeoutWith(idleTimeout, Observable.throw(new Error('command timeout')))
      .merge(Observable.timer(jobTimeout).timeInterval().mergeMap((): any => {
        Observable.throw('job timeout');
      }))
      .subscribe((event: ProcessOutput) => {
        observer.next(event);
      }, err => {
        sub.unsubscribe();
        observer.error(err);
        stopContainer(name).subscribe((event: ProcessOutput) => {
          observer.next(event);
          observer.next({ type: 'data', data: err });
          observer.complete();
        });
      }, () => {
        sub.unsubscribe();
        stopContainer(name).subscribe((event: ProcessOutput) => {
          observer.next(event);
          observer.complete();
        });
      });
  });
}

function executeInContainer(name: string, cmd: Command): Observable<ProcessOutput> {
  return new Observable(observer => {
    const startTime = new Date().getTime();
    const start = nodePty.spawn('docker', ['start', name], { name: 'xterm-color' });

    const splitted = name.split('_');
    const build = splitted[1] || null;
    const job = splitted[2] || null;

    start.on('exit', startCode => {
      if (startCode !== 0) {
        const msg = `build: ${build} job: ${job} => errored with exit code ${startCode}`;
        observer.error(msg);
      }

      let executed = false;
      let success = false;
      let dk = null;
      let attach = null;

      if (cmd.command.includes('init.d') && cmd.command.includes('start')) {
        dk = 'Q';
        attach = nodePty.spawn('docker', ['attach', `--detach-keys=${dk}`, name]);
      } else {
        attach = nodePty.spawn('docker', ['exec', `-it`, name, 'bash', '-l']);
      }

      attach.on('data', data => {
        if (!executed) {
          const exec = `/usr/bin/abstruse '${cmd.command}'\r`;
          attach.write(exec);

          // don't show access token on UI
          if (cmd.command.includes('http') && cmd.command.includes('@')) {
            cmd.command = cmd.command.replace(/\/\/(.*)@/, '//');
          }

          if (cmd.type === CommandType.store_cache) {
            observer.next({ type: 'data', data: yellow('==> restoring cache ...') + '\r' });
          } else if (cmd.type === CommandType.restore_cache) {
            observer.next({ type: 'data', data: yellow('==> saving cache ...') + '\r' });
          } else {
            observer.next({ type: 'data', data: yellow('==> ' + cmd.command) + '\r' });
          }
          executed = true;
        } else {
          if (data.includes('[success]')) {
            if (cmd.type === CommandType.script) {
              observer.next({ type: 'data', data: green(data.replace(/\n\r/g, '')) });
            }

            success = true;
            if (dk) {
              attach.write(dk);
            } else {
              attach.write('pkill -9 sleep && exit 100\r');
            }
          } else if (data.includes('[error]')) {
            attach.kill();
            observer.error(red(data.replace(/\n\r/g, '')));
          } else if (!data.includes('/usr/bin/abstruse') &&
            !data.includes('exit 100') && !data.includes('logout') &&
            !data.includes('read escape sequence')) {
            observer.next({ type: 'data', data: data.replace('> ', '') });
          }
        }
      });

      attach.on('exit', code => {
        const endTime = new Date().getTime();
        const totalTime = endTime - startTime;

        if (code !== 0 && !success) {
          observer.next({ type: 'data', data: `[exectime]: ${totalTime}` });
          observer.next({ type: 'exit', data: code });
          observer.complete();
        } else {
          observer.next({ type: 'data', data: `[exectime]: ${totalTime}` });
          observer.next({ type: 'exit', data: '0' });
          observer.complete();
        }
      });
    });
  });
}

function executeOutsideContainer(cmd: string): Observable<ProcessOutput> {
  return new Observable(observer => {
    const proc = child_process.exec(cmd);

    proc.stdout.on('data', data => console.log(data.toString()));
    proc.stderr.on('data', data => console.log(data.toString()));

    proc.on('close', code => {
      observer.next({ type: 'exit', data: code.toString() });
      observer.complete();
    });
  });
}

function startContainer(name: string, image: string, vars = []): Observable<ProcessOutput> {
  return new Observable(observer => {
    docker.killContainer(name)
      .then(() => {
        const args = ['run', '-dit', '--privileged', '-P']
          .concat('-m=2048M', '--cpus=2')
          .concat(vars)
          .concat('--name', name, image);

        const process = nodePty.spawn('docker', args);

        process.on('exit', exitCode => {
          if (exitCode !== 0) {
            observer.error(`error starting container ${exitCode}`);
          } else {
            observer.next({
              type: 'container',
              data: `container ${name} succesfully started`
            });
          }

          observer.complete();
        });
      });
  });
}

export function stopContainer(name: string): Observable<ProcessOutput> {
  return new Observable(observer => {
    const process = nodePty.spawn('docker', [
      'rm',
      '-f',
      name
    ]);

    process.on('exit', exitCode => {
      observer.next({
        type: 'container',
        data: `container ${name} succesfully stopped.`
      });

      observer.complete();
    });
  });
}

function getContainerExposedPort(name: string, port: number): Observable<ProcessOutput> {
  return new Observable(observer => {
    const process = nodePty.spawn('docker', [
      'port',
      name,
      port
    ]);

    process.on('data', data => {
      return observer.next({ type: 'exposed port', data: port + ':' + data.split(':')[1] });
    });
    process.on('exit', () => observer.complete());
  });
}

export function startDockerImageSetupJob(name: string): Job {
  let pty = new PtyInstance();
  let job: Job = {
    status: 'queued',
    type: 'build',
    pty: docker.buildImage(name),
    log: [],
    exitStatus: null
  };

  return job;
}

export function spawn(cmd: string, args: string[]): Promise<SpawnedProcessOutput> {
  return new Promise(resolve => {
    let stdout = '';
    let stderr = '';
    const command = child_process.spawn(cmd, args);

    command.stdout.on('data', data => stdout += data);
    command.stderr.on('data', data => stderr += data);
    command.on('exit', exit => {
      const output = { stdout, stderr, exit };
      resolve(output);
    });
  });
}

function saveCredentialsToImage(name: string, buildId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    getRepositoryByBuildId(buildId)
      .then(repo => {
        if (repo.username !== '' && repo.password !== '') {
          const matches = repo.clone_url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
          const domain = matches && matches[1];
          const cmd = `echo 'machine ${domain} login ${repo.username} password ${repo.password}'` +
            `> /home/abstruse/.netrc`;
          const save = nodePty.spawn('docker', [
            'exec',
            name,
            'sh',
            '-c',
            cmd
          ]);

          save.on('exit', () => resolve());
        } else {
          resolve();
        }
      });
  });
}
