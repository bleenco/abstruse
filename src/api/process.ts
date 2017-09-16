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
  data: any;
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
      .map(cmd => cmd.command.replace('export', ''))
      .reduce((acc, curr) => acc.concat(curr.split(' ')), [])
      .concat(proc.env)
      .concat(variables)
      .filter(Boolean);

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
      let cacheFile = `cache_${proc.repo_name.replace('/', '-')}_${proc.branch}.tgz`;
      let cacheHostPath = getFilePath(`cache/${cacheFile}`);
      let cacheContainerPath = `/home/abstruse/${cacheFile}`;
      let copyRestoreCmd = [
        `if [ -e ${cacheHostPath} ]; `,
        `then docker cp ${cacheHostPath} ${name}:/home/abstruse; fi`
      ].join('');
      let restoreCmd = [
        `if [ -e ${cacheContainerPath} ]; `,
        `then tar xf ${cacheContainerPath} -C .; fi`
      ].join('');

      restoreCache = Observable.concat(...[
        executeOutsideContainer(copyRestoreCmd),
        docker.attachExec(name, { command: restoreCmd, type: CommandType.restore_cache })
      ]);

      let tarCmd = [
        `if [ ! -e ${cacheContainerPath} ];`,
        `then tar cfz ${cacheContainerPath} ${proc.cache.join(' ')}; fi`,
      ].join('');
      let saveTarCmd = [,
        `if [ ! -e ${cacheHostPath} ];`,
        `then docker cp ${name}:${cacheContainerPath} ${cacheHostPath}; fi`,
      ].join('');

      saveCache = Observable.concat(...[
        docker.attachExec(name, { command: tarCmd, type: CommandType.store_cache }),
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
        docker.attachExec(name, { command: ssh, type: CommandType.before_install }),
        getContainerExposedPort(name, 22),
        docker.attachExec(name, { command: xvfb, type: CommandType.before_install }),
        docker.attachExec(name, { command: vnc, type: CommandType.before_install }),
        getContainerExposedPort(name, 5900)
      ]);
    }

    const sub = docker.createContainer(name, image, envs)
      .concat(debug)
      .concat(...gitCommands.map(cmd => docker.attachExec(name, cmd)))
      .concat(restoreCache)
      .concat(...installCommands.map(cmd => docker.attachExec(name, cmd)))
      .concat(saveCache)
      .concat(...scriptCommands.map(cmd => docker.attachExec(name, cmd)))
      .concat(...deployCommands.map(cmd => docker.attachExec(name, cmd)))
      .timeoutWith(idleTimeout, Observable.throw(new Error('command timeout')))
      .takeUntil(Observable.timer(jobTimeout).timeInterval().mergeMap(() => {
        return Observable.throw('job timeout');
      }))
      .subscribe((event: ProcessOutput) => {
        if (event.type === 'exit') {
          if (Number(event.data) !== 0) {
            const msg = [
              `build: ${proc.build_id} job: ${proc.job_id} =>`,
              `last executed command exited with code ${event.data}`
            ].join(' ');
            const tmsg = `[error]: executed command returned exit code ${event.data}`;
            observer.next({ type: 'data', data: red(tmsg) });
            sub.unsubscribe();
            observer.error(msg);
            observer.complete();
          }
        } else {
          observer.next(event);
        }
      }, err => {
        sub.unsubscribe();
        observer.error(err);
        observer.complete();
      }, () => {
        sub.unsubscribe();
        const msg = '[success]: build finished with exit code 0';
        observer.next({ type: 'data', data: green(msg) });
        observer.complete();
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
