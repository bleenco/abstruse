import * as uuid from 'uuid';
import * as docker from './docker';
import { PtyInstance } from './pty';

export interface Process {
  id: string;
  status: 'queue' | 'starting' | 'running' | 'stopped' | 'success' | 'errored';
  type: 'setup' | 'build';
  pty: any;
  log: string[];
  exitStatus: number;
  repositoryId?: number;
}

export let processes: Process[] = [];

export function startBuildProcess(uuid: string, repositoryId: number): Process {
  let pty = new PtyInstance(uuid);
  let proc: Process = {
    id: uuid,
    status: 'starting',
    type: 'build',
    pty: docker.runInteractive(uuid, 'abstruse').share(),
    log: [],
    exitStatus: null,
    repositoryId: repositoryId
  };

  return proc;
}

export function exitProcess(id: string): void {
  const index = processes.findIndex(proc => proc.id === id);
  if (index === -1) {
    return;
  }

  const proc = processes[index];

  proc.pty.next({ action: 'exit' });
  processes = processes.filter(process => process.id !== id);
}
