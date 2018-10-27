import * as docker from './docker';
import * as child_process from 'child_process';
import { generateRandomId, prepareCommands } from './utils';
import { getFilePath } from './setup';
import { Observable, concat, throwError, empty, timer } from 'rxjs';
import { timeoutWith, takeUntil, mergeMap, timeInterval } from 'rxjs/operators';
import { CommandType, Command, CommandTypePriority } from './config';
import { JobProcess } from './process-manager';
import * as envVars from './env-variables';
import chalk from 'chalk';
import * as style from 'ansi-styles';
import { deploy } from './deploy';

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
  type: 'data' | 'exit' | 'container' | 'exposed ports' | 'containerInfo' | 'containerError' |
  'env';
  data: any;
}

export function startBuildProcess(
  proc: JobProcess,
  envs: envVars.EnvVariables,
  jobTimeout: number,
  idleTimeout: number
): Observable<ProcessOutput> {
  return new Observable(observer => {
    let image = proc.image_name;
    let name = 'abstruse_' + proc.build_id + '_' + proc.job_id;

    proc.commands
      .filter(cmd => typeof cmd.command === 'string' && cmd.command.startsWith('export'))
      .map(cmd => cmd.command.replace('export', ''))
      .reduce((acc, curr) => acc.concat(curr.split(' ')), [])
      .concat(proc.env.reduce((acc, curr) => acc.concat(curr.split(' ')), []))
      .forEach(env => {
        let splitted = env.split('=');
        if (splitted.length > 1) {
          envVars.set(envs, splitted[0], splitted[1]);
        }
      });

    let gitTypes = [CommandType.git];
    let installTypes = [CommandType.before_install, CommandType.install];
    let scriptTypes = [CommandType.before_script, CommandType.script,
    CommandType.after_success, CommandType.after_failure,
    CommandType.after_script];

    let gitCommands = prepareCommands(proc, gitTypes);
    let installCommands = prepareCommands(proc, installTypes);
    let scriptCommands = prepareCommands(proc, scriptTypes);
    let beforeDeployCommands = prepareCommands(proc, [CommandType.before_deploy]);
    let afterDeployCommands = prepareCommands(proc, [CommandType.after_deploy]);
    let deployCommands = prepareCommands(proc, [CommandType.deploy]);

    let deployPreferences;
    if (deployCommands.length && typeof deployCommands[0].command === 'object') {
      deployPreferences =
        deployCommands.reduce((curr, acc) => Object.assign(acc.command, curr), {});
      deployCommands = [];
    }

    let restoreCache: Observable<any> = empty();
    let saveCache: Observable<any> = empty();
    if (proc.repo_name && proc.branch && proc.cache) {
      let cacheFile = `cache_${proc.repo_name.replace('/', '-')}_${proc.branch.replace('/', '-')}.tgz`;
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

      restoreCache = concat(...[
        executeOutsideContainer(copyRestoreCmd),
        docker.dockerExec(
          name, { command: restoreCmd, type: CommandType.restore_cache, env: envs })
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

      saveCache = concat(...[
        docker.dockerExec(
          name, { command: tarCmd, type: CommandType.store_cache, env: envs }),
        executeOutsideContainer(saveTarCmd)
      ]);
    }

    let sub = concat(
      docker.createContainer(name, image, envs),
      docker.dockerPwd(name, envs),
      ...gitCommands.map(cmd => docker.dockerExec(name, cmd, envs)),
      restoreCache,
      ...installCommands.map(cmd => docker.dockerExec(name, cmd, envs)),
      saveCache,
      ...scriptCommands.map(cmd => docker.dockerExec(name, cmd, envs)),
      ...beforeDeployCommands.map(cmd => docker.dockerExec(name, cmd, envs)),
      ...deployCommands.map(cmd => docker.dockerExec(name, cmd, envs)),
      deploy(deployPreferences, name, envs),
      ...afterDeployCommands.map(cmd => docker.dockerExec(name, cmd, envs))
    )
      .pipe(
        timeoutWith(idleTimeout, throwError(new Error('command timeout'))),
        takeUntil(timer(jobTimeout).pipe(
          timeInterval(),
          mergeMap(() => throwError('job timeout')))
        )
      )
      .subscribe((event: ProcessOutput) => {
        if (event.type === 'env') {
          if (Object.keys(event.data).length) {
            envs = event.data;
          }
        } else if (event.type === 'containerError') {
          let msg = chalk.red((event.data.json && event.data.json.message) || event.data);
          observer.next({ type: 'exit', data: msg });
          observer.error(msg);
        } else if (event.type === 'containerInfo') {
          observer.next({
            type: 'exposed ports',
            data: { type: 'ports', info: event.data.NetworkSettings.Ports }
          });
        } else if (event.type === 'exit') {
          if (Number(event.data) !== 0) {
            let msg = [
              `build: ${proc.build_id} job: ${proc.job_id} =>`,
              `last executed command exited with code ${event.data}`
            ].join(' ');
            let tmsg = style.red.open + style.bold.open +
              `\r\n[error]: executed command returned exit code ${event.data}` +
              style.bold.close + style.red.close;
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
          .catch(e => console.error(e));
      }, () => {
        let msg = style.green.open + style.bold.open +
          '\r\n[success]: build returned exit code 0' +
          style.bold.close + style.green.close;
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
    let proc = child_process.exec(cmd);

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
    let command = child_process.spawn(cmd, args);

    command.stdout.on('data', data => stdout += data);
    command.stderr.on('data', data => stderr += data);
    command.on('exit', exit => {
      let output = { stdout, stderr, exit };
      resolve(output);
    });
  });
}
