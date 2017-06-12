import { prepareBuildJob, Job, startDockerImageSetupJob } from './process';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';
import * as dbJob from './db/job';
import { getRepository } from './db/repository';
import { getRepositoryDetails, generateCommands } from './config';
import { killContainer } from './docker';
import * as logger from './logger';
import { blue, yellow, green, cyan } from 'chalk';
import { getConfig } from './utils';

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
  status?: 'queued' | 'running';
  image_name?: string;
  job: Subject<JobMessage> | Observable<JobMessage> | any;
  log: string[];
}

export interface JobProcessEvent {
  build_id?: number;
  job_id?: number;
  type?: string;
  data?: string;
}

const config: any = getConfig();
export let jobProcesses: JobProcess[] = [];
export let jobEvents: BehaviorSubject<JobProcessEvent> = new BehaviorSubject({});
export let terminalEvents: Subject<JobProcessEvent> = new Subject();

jobEvents
  .filter(event => !!event.build_id && !!event.job_id)
  .subscribe(event => {
    let msg = `${blue('build:')} ${event.build_id} ${blue('job:')} ${event.job_id} - ` +
      yellow(event.data);
    logger.info(msg);
  });

// main scheduler
let processing = false;
Observable.interval(1000)
  .timeInterval()
  .mergeMap(() => processing ? Observable.empty() : Observable.of(null))
  .subscribe(() => {
    const concurrency = config.concurrency || 10;
    const running = jobProcesses.filter(jobProcess => jobProcess.status === 'running');
    const queued = jobProcesses.filter(jobProcess => jobProcess.status === 'queued');

    if (running.length >= concurrency || queued.length === 0) {
      return;
    }

    const current = running.length;
    const num = queued.length > concurrency ? concurrency - current : queued.length - current;
    if (num > 0) {
      processing = true;
      Promise.all(queued.slice(0, num).map(queuedJob => {
        return startJob(queuedJob.build_id, queuedJob.job_id);
      })).then(() => processing = false);
    } else {
      processing = false;
    }
  });

// inserts new build into db and queue related jobs.
// returns inserted build id
export function startBuild(repositoryId: number, branch: string): Promise<null> {
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
                  jobEvents.next({
                    type: 'process',
                    build_id: build.id,
                    job_id: job.id,
                    data: 'jobAdded'
                  });

                  return queueJob(build.id, job.id);
                });
              }));
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

function queueJob(buildId: number, jobId: number): Promise<null> {
  return dbJob.updateJob({ id: jobId, start_time: new Date(), status: 'queued' })
    .then(jobData => {
      const jobProcess: JobProcess = {
        build_id: buildId,
        job_id: jobId,
        status: 'queued',
        job: prepareJob(buildId, jobId, JSON.parse(jobData.commands)),
        log: []
      };

      jobProcesses.push(jobProcess);

      jobEvents.next({ type: 'process', build_id: buildId, job_id: jobId, data: 'jobQueued' });
    });
}

export function startJob(buildId: number, jobId: number): Promise<null> {
  const index = jobProcesses.findIndex(job => job.job_id === jobId);
  if (index !== -1) {
    jobProcesses[index].status = 'running';
    jobProcesses[index].job
      .skip(1)
      .subscribe(event => {
        terminalEvents.next(event);
        if (event.data) {
          jobProcesses[index].log.push(event.data);
        }
      });

    return dbJob.updateJob({ id: jobId, start_time: new Date(), status: 'running' })
      .then(jobData => {
        jobEvents.next({ type: 'process', build_id: buildId, job_id: jobId, data: 'jobStarted' });
      });
  } else {
    return Promise.resolve();
  }
}

export function restartJob(jobId: number): Promise<null> {
  if (getJobProcess(jobId)) {
    let jobData;
    return dbJob.resetJob(jobId)
      .then(job => {
        jobData = job;
        jobEvents.next({
          type: 'process',
          build_id: job.builds_id,
          job_id: job.id,
          data: 'jobRestarted'
        });

        return stopJob(jobId);
      })
      .then(() => queueJob(jobData.builds_id, jobData.id));
  } else {
    dbJob.getJob(jobId).then(job => queueJob(job.builds_id, job.id));
  }
}

export function stopJob(jobId: number): Promise<any> {
  const index = jobProcesses.findIndex(job => job.job_id === jobId);
  if (index !== -1) {
    const job = jobProcesses[index];
    const log = job.log.join('\n');
    jobProcesses = jobProcesses.filter(jobProcess => jobProcess.job_id !== jobId);

    jobEvents.next({
      type: 'process',
      build_id: job.build_id,
      job_id: job.job_id,
      data: 'jobStopped'
    });

    return dbJob.updateJob({ id: jobId, end_time: new Date(), status: 'failed', log: log })
      .then(() => killContainer(`${job.build_id}_${job.job_id}`).toPromise())
      .then(() => job);
  } else {
    return dbJob.updateJob({ id: jobId, end_time: new Date(), status: 'failed' });
  }
}

function prepareJob(buildId: number, jobId: number,  cmds: any): Observable<JobMessage> {
  return new Observable(observer => {
    let job = prepareBuildJob(buildId, jobId, cmds);

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
        const log = (index !== -1) ? jobProcesses[index].log.join('\n') : '';

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

          // remove from process list
          const index = jobProcesses.findIndex(jp => jp.job_id === jobId);
          if (index !== -1) {
            jobProcesses.splice(index, 1);
          }

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
