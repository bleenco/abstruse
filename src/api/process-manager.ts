import * as uuid from 'uuid';
import { getRepository } from './db/repository';
import { startBuildProcess, processes, Process } from './process';
import { Observable, BehaviorSubject } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';

export function startBuild(repositoryId: number): Promise<Process> {
  return new Promise((resolve, reject) => {
    getRepository(repositoryId).then(data => {
      const uuid = generateId();

      insertBuild({ uuid: uuid, repositories_id: repositoryId }).then(insertedBuild => {
        let proc = startBuildProcess(uuid, repositoryId);
        const splitted = data.url.split('/');
        const name = splitted[splitted.length - 1].replace(/\.git/, '');

        let cmds = [
          '/etc/init.d/xvfb start',
          'export DISPLAY=:99',
          'export CHROME_BIN=chromium-browser',
          `git clone --depth 50 -q ${data.url} ${name}`,
          `cd ${name}`,
          'yarn',
          'yarn test',
          'exit $?'
        ].forEach(command => {
          proc.pty.next({ action: 'command', message: command });
        });

        processes.push(proc);

        proc.pty.subscribe(data => {
          if (proc.status === 'starting') {
            proc.status = 'running';
          }

          if (data.type === 'data') {
            proc.log.push(data.data);
          } else if (data.type === 'exit') {
            updateBuild({
              id: insertedBuild.toJSON().id,
              status: data.status,
              log: proc.log.join('\n')
            }).then(() => {
              proc.exitStatus = data.data;
              proc.status = proc.exitStatus === 0 ? 'success' : 'errored';
            });
          }
        });

        resolve(proc);
      });
    });
  });
}

export function restartBuild(uuid: number): Promise<Process> {
  return new Promise((resolve, reject) => {
    getBuild(uuid)
      .then(build => {
        let proc = startBuildProcess(build.uuid, build.repositoryId);
        const splitted = build.repository.url.split('/');
        const name = splitted[splitted.length - 1].replace(/\.git/, '');

        let cmds = [
          '/etc/init.d/xvfb start',
          'export DISPLAY=:99',
          'export CHROME_BIN=chromium-browser',
          `git clone --depth 50 -q ${build.repository.url} ${name}`,
          `cd ${name}`,
          'yarn',
          'yarn test',
          'exit $?'
        ].forEach(command => {
          proc.pty.next({ action: 'command', message: command });
        });

        processes.push(proc);

        proc.pty.subscribe(data => {
          if (proc.status === 'starting') {
            proc.status = 'running';
          }

          if (data.type === 'data') {
            proc.log.push(data.data);
          } else if (data.type === 'exit') {
            updateBuild({
              id: build.id,
              status: data.status,
              log: proc.log.join('\n')
            }).then(() => {
              proc.exitStatus = data.data;
              proc.status = proc.exitStatus === 0 ? 'success' : 'errored';
            });
          }
        });

        resolve(proc);
      });
  });
}

export function getRunningBuild(id: string): Observable<any> {
  const index = processes.findIndex(proc => proc.id === id);
  return processes[index].pty.asObservable();
}

export function getAllRunningBuilds(): Observable<any> {
  return Observable.merge(...processes.map(proc => getRunningBuild(proc.id)));
}

export function getAllProcesses(): Process[] {
  return processes;
}

export function getProcess(buildId: string): Process {
  return processes[processes.findIndex(proc => proc.id === buildId)] || null;
}

function generateId(): string {
  return uuid();
}
