import { startBuildJob, Job, startDockerImageSetupJob } from './process';
import { Observable, Subject } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';
import { insertJob } from './db/job';
import { getRepository } from './db/repository';
import { getRepositoryDetails, generateCommands } from './config';
import { killContainer } from './docker';

export interface BuildMessage {
  type: string;
  jobMessage: JobMessage;
}

export interface JobMessage {
  build_id?: number;
  job_id?: number;
  image_name?: string;
  type: string;
  data: string | number;
}

export interface JobProcess {
  build_id?: number;
  job_id?: number;
  image_name?: string;
  job: Subject<JobMessage> | Observable<JobMessage> | any;
}

export let jobProcesses: JobProcess[] = [];

// inserts new build into db and queue related jobs.
// returns inserted build id
export function startBuild(repositoryId: number, branch: string): Promise<number> {
  return getRepository(repositoryId)
    .then(repository => {
      return getRepositoryDetails(repository.url)
        .then(details => {
          const buildData = {
            branch: branch,
            commit_hash: details.log.commit_hash,
            commit_author: details.log.commit_author,
            commit_date: details.log.commit_date,
            commit_message: details.log.commit_message,
            start_time: new Date(),
            repositories_id: repositoryId
          };

          return insertBuild(buildData)
            .then(build => {
              let jobsCommands = generateCommands(repository.url, details.config);

              return Promise.all(jobsCommands.map((commands, i) => {
                const data = {
                  start_time: new Date(),
                  end_time: null,
                  status: 'queued',
                  commands: JSON.stringify(commands),
                  log: '',
                  builds_id: build.id
                };

                return insertJob(data).then(job => {
                  const jobProcess: JobProcess = {
                    build_id: build.id,
                    job_id: job.id,
                    job: queueJob(build.id, job.id, commands)
                  };

                  jobProcesses.push(jobProcess);
                });
              }))
              .then(() => {
                return build.id;
              });
            });
        });
    });
}

export function restartBuild(buildId: number): Promise<null> {
  return getBuild(buildId)
    .then(build => {
      build.start_time = new Date();
      build.end_time = null;

      return updateBuild(build)
        .then(() => {

        });
    });
}

export function stopBuild(buildId: number): void {
  jobProcesses.forEach(jobProcess => {
    if (jobProcess.build_id === buildId) {
      jobProcess.job.next({ action: 'exit' });
    }
  });
}

export function startSetup(name: string): void {
  const setup: JobProcess = {
    image_name: name,
    job: queueSetupDockerImage(name)
  };

  jobProcesses.push(setup);
}

export function queueSetupDockerImage(name: string): Observable<JobMessage> {
  let job = startDockerImageSetupJob(name);

  let jobOutput = new Observable(observer => {
    job.pty.subscribe(output => {
      const message: JobMessage = {
        image_name: name,
        type: output.type,
        data: output.data
      };

      observer.next(message);

      if (output.type === 'exit') {
        jobProcesses = jobProcesses.filter(jobProcess => {
          if (jobProcess.image_name && jobProcess.image_name === name) {
            return false;
          } else {
            return true;
          }
        });

        observer.complete();
      }
    }, err => {
      console.error(err);
    }, () => {
      observer.complete();
    });
  });

  return jobOutput;
}

export function queueJob(buildId: number, jobId: number, commands: string[]): Subject<JobMessage> {
  let job = startBuildJob(buildId, jobId);

  let jobOutput = new Observable(observer => {
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

export function findDockerImageBuildJob(name: string): JobProcess | null {
  const index = jobProcesses.findIndex(job => job.image_name && job.image_name === name);
  return jobProcesses[index] || null;
}

export function getJobsForBuild(buildId: number): JobProcess[] {
  return jobProcesses.filter(jobProcess => jobProcess.build_id === buildId);
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

// startBuild().then(() => {
//   jobProcesses.forEach(jobProcess => {
//     let sub = jobProcess.job.subscribe(event => {
//       console.log(event);
//     }, err => {
//       console.error(err);
//     }, () => {
//       console.log('done');
//     });
//   });

//   setTimeout(() => stopBuild(1), 3000);
// });
