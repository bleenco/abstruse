import * as uuid from 'uuid';
import * as docker from './docker';
import { PtyInstance } from './pty';

export interface Process {
  id: string;
  status: 'starting' | 'running' | 'done';
  type: 'setup' | 'build';
  pty: any;
  log: string[];
  exitStatus: string;
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

