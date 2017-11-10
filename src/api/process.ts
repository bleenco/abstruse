import * as docker from './docker';
import * as child_process from 'child_process';
import { generateRandomId, getFilePath, prepareCommands } from './utils';
import { getRepositoryByBuildId } from './db/repository';
import { Observable } from 'rxjs';
import { CommandType, Command, CommandTypePriority } from './config';
import { JobProcess } from './process-manager';
import chalk from 'chalk';

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
  type: 'data' | 'exit' | 'container' | 'exposed ports' | 'containerInfo' | 'containerError';
  data: any;
}

export function startBuildProcess(
  proc: JobProcess,
  variables: string[],
  jobTimeout: number,
  idleTimeout: number
): Observable<ProcessOutput> {
  return new Observable(observer => {
    const image = proc.image_name;

    const name = 'abstruse_' + proc.build_id + '_' + proc.job_id;
    const envs = proc.commands.filter(cmd => cmd.command.startsWith('export'))
      .map(cmd => cmd.command.replace('export', ''))
      .reduce((acc, curr) => acc.concat(curr.split(' ')), [])
      .concat(proc.env.reduce((acc, curr) => acc.concat(curr.split(' ')), []))
      .concat(variables)
      .filter(Boolean);

    const gitTypes = [CommandType.git];
    const installTypes = [CommandType.before_install, CommandType.install];
    const scriptTypes = [CommandType.before_script, CommandType.script,
      CommandType.after_success, CommandType.after_failure, CommandType.after_script];
    const deployTypes = [CommandType.before_deploy, CommandType.deploy, CommandType.after_deploy];
    const gitCommands = prepareCommands(proc, gitTypes);
    const installCommands = prepareCommands(proc, installTypes);
    const scriptCommands = prepareCommands(proc, scriptTypes);
    const deployCommands = prepareCommands(proc, deployTypes);

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
        `then tar xf ${cacheContainerPath} -C /; fi`
      ].join('');

      restoreCache = Observable.concat(...[
        executeOutsideContainer(copyRestoreCmd),
        docker.attachExec(name, { command: restoreCmd, type: CommandType.restore_cache })
      ]);

      let cacheFolders = proc.cache.map(folder => {
        if (folder.startsWith('/')) {
          return folder;
        } else {
          return `/home/abstruse/build/${folder}`;
        }
      }).join(' ');

      let tarCmd = [
        `if [ ! -e ${cacheContainerPath} ]; `,
        `then tar cfz ${cacheContainerPath} ${cacheFolders}; fi`,
      ].join('');
      let saveTarCmd = [,
        `if [ ! -e ${cacheHostPath} ]; `,
        `then docker cp ${name}:${cacheContainerPath} ${cacheHostPath}; fi`,
      ].join('');

      saveCache = Observable.concat(...[
        docker.attachExec(name, { command: tarCmd, type: CommandType.store_cache }),
        executeOutsideContainer(saveTarCmd)
      ]);
    }

    const sub = docker.createContainer(name, image, envs)
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
        if (event.type === 'containerError') {
          const msg = chalk.red(event.data.json.message) || chalk.red(event.data);
          observer.next({ type: 'exit', data: msg });
          observer.error(msg);
        } else if (event.type === 'containerInfo') {
          observer.next({
            type: 'exposed ports',
            data: { type: 'ports', info: event.data.NetworkSettings.Ports }
          });
        } else if (event.type === 'exit') {
          if (Number(event.data) !== 0) {
            const msg = [
              `build: ${proc.build_id} job: ${proc.job_id} =>`,
              `last executed command exited with code ${event.data}`
            ].join(' ');
            const tmsg = chalk.bold(`[error]: executed command returned exit code ${event.data}`);
            observer.next({ type: 'exit', data: chalk.red(tmsg) });
            observer.error(msg);
            docker.killContainer(name)
              .then(() => {
                sub.unsubscribe();
                observer.complete();
              })
              .catch(err => console.error(err));
          }
        } else {
          observer.next(event);
        }
      }, err => {
        observer.error(err);
        docker.killContainer(name)
          .then(() => {
            sub.unsubscribe();
            observer.complete();
          })
          .catch(err => console.error(err));
      }, () => {
        const msg = chalk.bold('[success]: build returned exit code 0');
        observer.next({ type: 'exit', data: chalk.green(msg) });
        docker.killContainer(name)
          .then(() => {
            sub.unsubscribe();
            observer.complete();
          })
          .catch(err => console.error(err));
      });

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
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
