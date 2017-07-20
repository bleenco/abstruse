import * as child_process from 'child_process';
import { blue, yellow } from 'chalk';
const treeKill = require('tree-kill');

interface ExecOptions {
  silent?: boolean;
}

interface ProcessOutput {
  stdout: string;
  stderr: string;
  code: number;
}

let _processes: child_process.ChildProcess[] = [];

function _run(options: ExecOptions, cmd: string, args: string[]): Promise<ProcessOutput> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const cwd = process.cwd();
    console.log(
      `==========================================================================================`
    );

    args = args.filter(x => x !== undefined);
    const flags = [
      options.silent || false
    ]
      .filter(x => !!x)
      .join(', ')
      .replace(/^(.+)$/, ' [$1]');

    console.log(blue(`Running \`${cmd} ${args.map(x => `"${x}"`).join(' ')}\`${flags}...`));
    console.log(blue(`CWD: ${cwd}`));
    const spawnOptions: any = {cwd};

    if (process.platform.startsWith('win')) {
      args.unshift('/c', cmd);
      cmd = 'cmd.exe';
      spawnOptions['stdio'] = 'pipe';
    }

    const childProcess = child_process.spawn(cmd, args, spawnOptions);

    _processes.push(childProcess);

    childProcess.stdout.on('data', (data: Buffer) => {
      setTimeout(() => resolve(), 100);

      stdout += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.log('  ' + line));
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.error(yellow('  ' + line)));
    });

    childProcess.on('close', (code: number) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        const err = new Error(`Running "${cmd} ${args.join(' ')}" returned error code `);
        reject(err);
      }
    });
  });
}

function _exec(options: ExecOptions, cmd: string, args: string[]): Promise<ProcessOutput> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const cwd = process.cwd();
    console.log(
      `==========================================================================================`
    );

    args = args.filter(x => x !== undefined);
    const flags = [
      options.silent || false
    ]
      .filter(x => !!x)
      .join(', ')
      .replace(/^(.+)$/, ' [$1]');

    console.log(blue(`Running \`${cmd} ${args.map(x => `"${x}"`).join(' ')}\`${flags}...`));
    console.log(blue(`CWD: ${cwd}`));
    const spawnOptions: any = {cwd};

    if (process.platform.startsWith('win')) {
      args.unshift('/c', cmd);
      cmd = 'cmd.exe';
      spawnOptions['stdio'] = 'pipe';
    }

    const childProcess = child_process.spawn(cmd, args, spawnOptions);

    _processes.push(childProcess);

    childProcess.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.log('  ' + line));
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
      if (options.silent) {
        return;
      }

      data.toString()
        .split(/[\n\r]+/)
        .filter(line => line !== '')
        .forEach(line => console.error(yellow('  ' + line)));
    });

    childProcess.on('close', (code: number) => {
      resolve({ stdout, stderr, code });
    });
  });
}

export function killAllProcesses(signal = 'SIGTERM'): Promise<void> {
  return Promise.all(_processes.map(process => killProcess(process.pid)))
    .then(() => { _processes = []; });
}

export function killProcess(pid: number): Promise<null> {
  return new Promise((resolve, reject) => {
    treeKill(pid, 'SIGTERM', err => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

export function exitCode(cmd: string): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(blue(`Running \`${cmd}\`...`));
    child_process.exec(cmd).on('exit', code => {
      resolve(code);
    });
  });
}

export function execute(options: ExecOptions, cmd: string): Promise<any> {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }

      if (!options.silent) {
        console.log(stdout);
      }
    }).on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Error running ${cmd}`));
      }
    });
  });
}

export function exec(cmd, args) {
  return _exec({ silent: false }, cmd, args);
}

export function execSilent(cmd, args) {
  return _exec({ silent: true }, cmd, args);
}

export function abstruse(tempDir = 'abstruse') {
  return _run({ silent: true }, 'abstruse', ['--dir', tempDir]);
}
