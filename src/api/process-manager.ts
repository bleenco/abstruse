import { startBuildJob, Job, startDockerImageSetupJob } from './process';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';
import * as dbJob from './db/job';
import { getRepository } from './db/repository';
import { getRepositoryDetails, generateCommands } from './config';
import { killContainer } from './docker';
import * as logger from './logger';

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
  log: string[];
}

export interface JobProcessEvent {
  build_id?: number;
  job_id?: number;
  type: string;
  data: string;
}

export let jobProcesses: JobProcess[] = [];
export let jobEvents: BehaviorSubject<JobProcessEvent> =
  new BehaviorSubject({ type: 'init', data: 'init' });
export let terminalEvents: Subject<JobProcessEvent> = new Subject();

jobEvents.subscribe(event => {
  logger.info(`build: ${event.build_id} job: ${event.job_id} - ${event.data}`);
});

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
                const lang = details.config.language;
                const langVersion = details.config.matrix[i].node_js; // TODO: update
                const testScript = details.config.matrix[i].env;

                const data = {
                  start_time: new Date(),
                  end_time: null,
                  status: 'queued',
                  commands: JSON.stringify(commands),
                  log: '',
                  language: lang,
                  language_version: langVersion,
                  test_script: testScript,
                  builds_id: build.id
                };

                return dbJob.insertJob(data).then(job => {
                  const jobProcess: JobProcess = {
                    build_id: build.id,
                    job_id: job.id,
                    job: queueJob(build.id, job.id, commands),
                    log: []
                  };

                  jobProcesses.push(jobProcess);
                  jobEvents.next({
                    type: 'process',
                    build_id: build.id,
                    job_id: job.id,
                    data: 'jobAdded'
                  });
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
        .then(() => dbJob.resetJobs(buildId))
        .then(() => {

        });
    });
}

export function stopBuild(buildId: number): void {
  jobProcesses.forEach(jobProcess => {
    if (jobProcess.build_id === buildId) {
      jobProcess.job.next({ action: 'exit' });
      jobEvents.next({
        type: 'process',
        build_id: jobProcess.build_id,
        job_id: jobProcess.job_id,
        data: 'jobStopped'
      });
    }
  });
}

export function startSetup(name: string): void {
  const setup: JobProcess = {
    image_name: name,
    job: queueSetupDockerImage(name),
    log: []
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

export function queueJob(buildId: number, jobId: number, commands: string[]):
  Observable<JobMessage> {
  return new Observable(observer => {
    let job = startBuildJob(buildId, jobId, commands);

    job.pty.subscribe(output => {
      const message: JobMessage = {
        build_id: buildId,
        job_id: jobId,
        type: output.type,
        data: output.data
      };

      observer.next(message);

      if (output.type === 'exit') {
        const index = jobProcesses.findIndex(job => job.job_id === jobId);
        const log = jobProcesses[index].log.join('\n');

        return dbJob.updateJob({
          id: jobId,
          end_time: new Date(),
          status: output.data === 0 ? 'success' : 'failed',
          log: log
        }).then(() => {
          jobEvents.next({
            type: 'process',
            build_id: buildId,
            job_id: jobId,
            data: output.data === 0 ? 'jobSucceded' : 'jobFailed'
          });

          observer.complete();
        });
      }
    }, err => {
      console.error(err);
    }, () => {
      observer.complete();
    });
  });
}

export function startJob(buildId: number, jobId: number, commands: any): Promise<null> {
  return dbJob.updateJob({ id: jobId, start_time: new Date(), status: 'running', log: '' })
    .then(() => {
      const jobProcess: JobProcess = {
        build_id: buildId,
        job_id: jobId,
        job: queueJob(buildId, jobId, JSON.parse(commands)),
        log: []
      };

      jobProcesses.push(jobProcess);
      const index = jobProcesses.findIndex(job => job.job_id === jobId);
      const ps = jobProcesses[index];

      jobProcess.job.skip(1).subscribe(event => {
        if (event.data) {
          ps.log.push(event.data);
          terminalEvents.next(event);
        }
      });

      jobEvents.next({ type: 'process', build_id: buildId, job_id: jobId, data: 'jobStarted' });
    });
}

export function restartJob(jobId: number): Promise<null> {
  return dbJob.resetJob(jobId)
    .then(job => {
      jobEvents.next({
        type: 'process',
        build_id: job.builds_id,
        job_id: job.id,
        data: 'jobRestarted'
      });
      return stopJob(jobId);
    })
    .then(jobData => {
      return startJob(jobData.builds_id, jobData.id, jobData.commands);
    });
}

export function stopJob(jobId: number): Promise<any> {
  let job;
  const index = jobProcesses.findIndex(job => job.job_id === jobId);
  const log = (index !== -1) ? jobProcesses[index].log.join('\n') : '';

  return dbJob.updateJob({ id: jobId, end_time: new Date(), status: 'failed', log: log })
    .then(jobData => {
      job = jobData;
      return killContainer(`${job.builds_id}_${job.id}`).toPromise();
    })
    .then(() => {
      const jobIndex = jobProcesses.findIndex(jobProcess => jobProcess.job_id === jobId);
      if (jobIndex !== -1) {
        const jobProcess = jobProcesses[jobIndex];
        jobEvents.next({
          type: 'process',
          build_id: jobProcess.build_id,
          job_id: jobProcess.job_id,
          data: 'jobStopped'
        });

        jobProcesses = jobProcesses.filter(jobProcess => jobProcess.job_id === jobId);
      }

      return job;
    });
}

export function findDockerImageBuildJob(name: string): JobProcess | null {
  const index = jobProcesses.findIndex(job => job.image_name && job.image_name === name);
  return jobProcesses[index] || null;
}

export function getJobProcess(jobId: number): JobProcess | null {
  const index = jobProcesses
    .findIndex(jobProcess => parseInt(<any>jobProcess.job_id, 10) === jobId);
  return index === -1 ? null : jobProcesses[index];
}

export function getJobsForBuild(buildId: number): JobProcess[] {
  return jobProcesses.filter(jobProcess => jobProcess.build_id === buildId);
}
