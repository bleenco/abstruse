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

export function startBuildProcess(id: string, repositoryId: number): Process {
  let pty = new PtyInstance(id);
  let proc: Process = {
    id: id,
    status: 'starting',
    type: 'build',
    pty: docker.runInteractive(id, 'abstruse').share(),
    log: [],
    exitStatus: null,
    repositoryId: repositoryId
  };

  return proc;
}

