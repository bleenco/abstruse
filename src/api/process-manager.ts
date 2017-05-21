import { getRepository } from './db/repository';
import { startBuildJob, jobs, Job, exitProcess } from './process';
import { Observable, BehaviorSubject } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';
import { getRepositoryDetails, generateCommands } from './config';

// export function startBuild(repositoryId: number): Promise<Process> {
//   return new Promise((resolve, reject) => {
//     getRepository(repositoryId).then(data => {
//       const uuid = generateId();

//       insertBuild({ uuid: uuid, repositories_id: repositoryId }).then(insertedBuild => {
//         let proc = startBuildProcess(uuid, repositoryId);
//         proc.status = 'starting';
//         const splitted = data.url.split('/');
//         const name = splitted[splitted.length - 1].replace(/\.git/, '');

//         let cmds = [
//           '/etc/init.d/xvfb start',
//           'export DISPLAY=:99',
//           'export CHROME_BIN=chromium-browser',
//           `git clone --depth 50 -q ${data.url} ${name}`,
//           `cd ${name}`,
//           'yarn',
//           'yarn test',
//           'exit $?'
//         ].forEach(command => {
//           proc.pty.next({ action: 'command', message: command });
//         });

//         processes.push(proc);

//         proc.pty.subscribe(data => {
//           if (proc.status !== 'running') {
//             proc.status = 'running';
//           }

//           if (data.type === 'data') {
//             proc.log.push(data.data);
//           } else if (data.type === 'exit') {
//             updateBuild({
//               id: insertedBuild.toJSON().id,
//               status: data.status,
//               log: proc.log.join('\n')
//             })
//             .then(() => {
//               proc.exitStatus = data.data;
//               proc.status = proc.exitStatus === 0 ? 'success' : 'errored';

//               exitProcess(uuid);
//             });
//           }
//         });

//         resolve(proc);
//       });
//     });
//   });
// }

// export function restartBuild(uuid: string): Promise<Process> {
//   return new Promise((resolve, reject) => {
//     getBuild(uuid)
//       .then(build => {
//         let proc = startBuildProcess(build.uuid, build.repositoryId);
//         const splitted = build.repository.url.split('/');
//         const name = splitted[splitted.length - 1].replace(/\.git/, '');

//         let cmds = [
//           '/etc/init.d/xvfb start',
//           'export DISPLAY=:99',
//           'export CHROME_BIN=chromium-browser',
//           `git clone --depth 50 -q ${build.repository.url} ${name}`,
//           `cd ${name}`,
//           'yarn',
//           'yarn test:e2e',
//           'exit $?'
//         ].forEach(command => {
//           proc.pty.next({ action: 'command', message: command });
//         });

//         processes.push(proc);

//         proc.pty.subscribe(data => {
//           if (proc.status === 'starting') {
//             proc.status = 'running';
//           }

//           if (data.type === 'data') {
//             proc.log.push(data.data);
//           } else if (data.type === 'exit') {
//             updateBuild({
//               id: build.id,
//               status: data.status,
//               log: proc.log.join('\n')
//             }).then(() => {
//               proc.exitStatus = data.data;
//               proc.status = proc.exitStatus === 0 ? 'success' : 'errored';

//               exitProcess(uuid);
//             });
//           }
//         });

//         resolve(proc);
//       });
//   });
// }

export interface BuildMessage {
  type: string;
  jobMessage: JobMessage;
}

export interface JobMessage {
  id: number;
  build_id: number;
  type: string;
  data: string | number;
}

export function startBuild(): Observable<BuildMessage> {
  return new Observable(observer => {
    let gitUrl = 'https://github.com/jkuri/bterm.git';

    getRepositoryDetails(gitUrl)
      .then(details => {
        // TODO: save initial build to database (or delete all logs)

        let commands = generateCommands(gitUrl, details.config);
        console.log(commands);

      });
  });
}

export function startJob(id: number, buildId: number): Observable<JobMessage> {
  return new Observable(observer => {
    let job = startBuildJob(id, buildId);

    // subscribe to job pty
    job.pty.subscribe(output => {
      const message: JobMessage = {
        id: id,
        build_id: buildId,
        type: output.type,
        data: output.data
      };

      observer.next(message);

      if (output.type === 'exit') {
        observer.complete();
      }
    }, err => {
      console.error(err);
    }, () => {
      observer.complete();
    });
  });
}

export function getRunningJob(id: number): Observable<any> {
  const index = jobs.findIndex(job => job.id === id);
  return jobs[index].pty.asObservable();
}

export function getAllRunningJobs(): Observable<any> {
  return Observable.merge(...jobs.map(job => getRunningJob(job.id)));
}

export function getAllJobs(): Job[] {
  return jobs;
}

export function getJob(id: number): Job {
  return jobs[jobs.findIndex(job => job.id === id)] || null;
}

startBuild().subscribe(event => {
  console.log(event);
});
