import { getRepository } from './db/repository';
import { startBuildJob, Job } from './process';
import { Observable, Subject } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';
import { getRepositoryDetails, generateCommands } from './config';
import { killContainer } from './docker';

export interface BuildMessage {
  type: string;
  jobMessage: JobMessage;
}

export interface JobMessage {
  build_id: number;
  job_id: number;
  type: string;
  data: string | number;
}

export interface JobProcess {
  build_id: number;
  job_id: number;
  job: Subject<JobMessage> | any;
}

export let jobProcesses: JobProcess[] = [];

export function startBuild(): Promise<null> {
  let gitUrl = 'https://github.com/jkuri/bterm.git';

  return getRepositoryDetails(gitUrl)
    .then(details => {
      // TODO: save initial build to database (or delete all logs)

      let jobsCommands = generateCommands(gitUrl, details.config);
      jobProcesses = jobProcesses.concat(jobsCommands.map((commands, i) => {
        return { build_id: 1, job_id: i + 1, job: queueJob(1, i + 1, commands) };
      }));
    });
}

export function stopBuild(buildId: number): void {
  jobProcesses.forEach(jobProcess => {
    if (jobProcess.build_id === buildId) {
      jobProcess.job.next({ action: 'exit' });
    }
  });
}

export function queueJob(buildId: number, jobId: number, commands: string[]): Subject<JobMessage> {
  let job = startBuildJob(buildId, jobId);

  let jobOutput =  new Observable(observer => {
    job.pty.subscribe(output => {
      const message: JobMessage = {
        build_id: buildId,
        job_id: jobId,
        type: output.type,
        data: output.data
      };

      observer.next(message);

      if (output.type === 'exit') {
        killContainer(`${buildId}_${jobId}`).toPromise()
          .then(() => {
            observer.complete();
          });
      }

      commands.forEach(command => job.pty.next({ action: 'command', message: command }));
    }, err => {
      console.error(err);
    }, () => {

    });
  });

  let jobObserver: any = {
    next(message) {
      job.pty.next(message);
    }
  };

  return Subject.create(jobObserver, jobOutput);
}

// export function getRunningJob(id: number): Observable<any> {
//   const index = jobs.findIndex(job => job.id === id);
//   return jobs[index].pty.asObservable();
// }

// export function getAllRunningJobs(): Observable<any> {
//   return Observable.merge(...jobs.map(job => getRunningJob(job.id)));
// }

// export function getAllJobs(): Job[] {
//   return jobs;
// }

// export function getJob(id: number): Job {
//   return jobs[jobs.findIndex(job => job.id === id)] || null;
// }

startBuild().then(() => {
  jobProcesses.forEach(jobProcess => {
    let sub = jobProcess.job.subscribe(event => {
      console.log(event);
    }, err => {
      console.error(err);
    }, () => {
      console.log('done');
    });
  });

  setTimeout(() => stopBuild(1), 3000);
});
