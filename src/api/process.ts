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
}

export let processes: Process[] = [];

export function startBuildProcess(): void {
  let pty = new PtyInstance();
  let id = uuid();


  let proc: Process = {
    id: id,
    status: 'starting',
    type: 'build',
    pty: docker.runInteractive(id, 'abstruse'),
    log: [],
    exitStatus: null
  };

  processes.push(proc);

  let cmds = [
    '/etc/init.d/xvfb start',
    'export DISPLAY=:99',
    'export CHROME_BIN=chromium-browser',
    'git clone --depth 50 -q https://github.com/bleenco/morose proj',
    'cd proj',
    'yarn',
    'yarn test',
    'exit $?'
  ];

  cmds.forEach(command => {
    proc.pty.next({ action: 'command', message: command });
  });

  proc.pty.subscribe(data => {
    if (data.type === 'data') {
      proc.log.push(data.message);
    } else if (data.type === 'exit') {
      proc.exitStatus = data.message;
    }
  });
}


