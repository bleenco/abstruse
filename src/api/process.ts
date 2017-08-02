import * as docker from './docker';
import { PtyInstance } from './pty';
import { getRepositoryDetails } from './config';
import * as child_process from 'child_process';
import { generateRandomId } from './utils';
import { getRepositoryByBuildId } from './db/repository';
import { Observable } from 'rxjs';
import { green, red, bold, yellow } from 'chalk';
const pty = require('child_pty');

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
  type: 'data' | 'exit' | 'container';
  data: string;
}

export function startBuildProcess(buildId: number, jobId: number,
  commands: string[], image: string): Observable<ProcessOutput> {
  return new Observable(observer => {
    const name = 'abstruse_' + buildId + '_' + jobId;
    const vars = commands.filter(cmd => cmd.startsWith('export'))
      .map(cmd => cmd.replace('export', '-e'));
    commands = commands.filter(cmd => !cmd.startsWith('export'));

    startContainer(name, image)
      .concat(...commands.map(command => executeInContainer(name, command, vars)))
      .subscribe((event: ProcessOutput) => {
        observer.next(event);
      }, err => {
        observer.next({ type: 'data', data: err });
        observer.error(err);
        stopContainer(name).subscribe((event: ProcessOutput) => observer.next(event));
      }, () => {
        observer.complete();
        stopContainer(name).subscribe((event: ProcessOutput) => observer.next(event));
      });
  });
}

function executeInContainer(name: string, command: string, vars = []): Observable<ProcessOutput> {
  return new Observable(observer => {
    const args = ['exec', '--privileged', '-it']
      .concat(vars)
      .concat(name, 'bash', '-l', '-c', `'${command}'`);
    const process = pty.spawn('docker', [args.join(' ')], { shell: true });

    observer.next({ type: 'data', data: bold(yellow(command)) + '\r\n' });
    process.stdout.on('data', data => observer.next({ type: 'data', data: data.toString() }));
    process.on('exit', exitCode => {
      if (exitCode !== 0) {
        observer.error(bold(`Executed command returned exit code ${red(exitCode.toString())}`));
      } else {
        observer.next({ type: 'exit', data: exitCode.toString() });
        observer.complete();
      }
    });
  });
}

function startContainer(name: string, image: string): Observable<ProcessOutput> {
  return new Observable(observer => {
    const args = ['run', '--privileged', '-dit', '--name', name, image];
    const process = pty.spawn('docker', args);

    process.on('exit', exitCode => {
      if (exitCode !== 0) {
        observer.error(`Error starting container (${exitCode})`);
      } else {
        observer.next({
          type: 'container',
          data: `Container ${bold(name)} succesfully started.`
        });
      }

      observer.complete();
    });
  });
}

function stopContainer(name: string): Observable<ProcessOutput> {
  return new Observable(observer => {
    const process = pty.spawn('docker', [
      'rm',
      '-f',
      name
    ]);

    process.on('exit', exitCode => {
      observer.next({
        type: 'container',
        data: `Container ${bold(name)} succesfully stopped.`
      });

      observer.complete();
    });
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
          const save = pty.spawn('docker', [
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
