import * as docker from './docker';
import { PtyInstance } from './pty';
import { getRepositoryDetails } from './config';
import * as child_process from 'child_process';
import { generateRandomId } from './utils';
import { Observable } from 'rxjs';
import { green, red } from 'chalk';
const pty = require('node-pty');

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

export function startBuildJob(buildId: number, jobId: number, commands: string[]): Job {
  let id = `${buildId}_${jobId}`;
  let pty = new PtyInstance();
  let job: Job = {
    status: 'queued',
    type: 'build',
    pty: runInDocker(id, 'abstruse', commands),
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

function runInDocker(name: string, image: string, cmds: string[]):
  Observable<{ type: string, data: string }> {
  return new Observable(observer => {
    const docker =
      pty.spawn('docker', ['run', '--privileged', '--name', name, '-dti', image]);
    let executed: boolean;

    docker.on('exit', code => {
      const attach = pty.spawn('docker', ['attach', name]);
      const commands = cmds.map(cmd => {
        if (cmd.includes('&')) {
          return `(${cmd}) ;`;
        } else {
          return `${cmd} ;`;
        }
      }).join(' ') + '\r';

      attach.on('data', data => {
        if (!executed) {
          attach.write(commands);
          executed = true;
        } else {
          observer.next({ type: 'data', data: data });
        }
      });

      attach.on('exit', exitCode => {
        const exit = exitCode === 0 ?
          green(`Process exited with code ${exitCode}`) :
          red(`Process errored with code ${exitCode}`);
        observer.next({ type: 'data', data: exit });

        observer.next({ type: 'exit', data: exitCode });

        const rm = pty.spawn('docker', ['rm', name, '-f']);
        rm.on('exit', () => observer.complete());
      });
    });
  });
}
