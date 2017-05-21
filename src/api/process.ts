import * as uuid from 'uuid';
import * as docker from './docker';
import { PtyInstance } from './pty';
import { getRepositoryDetails } from './config';
import * as child_process from 'child_process';

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

export function startBuildJob(buildId: number, jobId: number): Job {
  let id = `${buildId}_${jobId}`;
  let pty = new PtyInstance(id);
  let job: Job = {
    status: 'queued',
    type: 'build',
    pty: docker.runInteractive(id, 'abstruse'),
    log: [],
    exitStatus: null
  };

  return job;
}

// export function exitProcess(id: number): void {
//   const index = jobs.findIndex(proc => proc.id === id);
//   if (index === -1) {
//     return;
//   }

//   const proc = jobs[index];
//   proc.pty.next({ action: 'exit' });
//   jobs = jobs.filter(job => job.id !== id);
// }

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
