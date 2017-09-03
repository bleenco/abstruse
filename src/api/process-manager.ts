import { startDockerImageSetupJob, startBuildProcess, stopContainer } from './process';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { insertBuild, updateBuild, getBuild, getBuildStatus, getLastRunId } from './db/build';
import { insertBuildRun, updateBuildRun } from './db/build-run';
import * as dbJob from './db/job';
import * as dbJobRuns from './db/job-run';
import { getRepositoryOnly } from './db/repository';
import { getRemoteParsedConfig, JobsAndEnv, CommandType } from './config';
import { killContainer } from './docker';
import * as logger from './logger';
import { blue, yellow, green, cyan } from 'chalk';
import { getConfig, getHttpJsonResponse, getBitBucketAccessToken } from './utils';
import { sendFailureStatus, sendPendingStatus, sendSuccessStatus } from './commit-status';

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
  status?: 'queued' | 'running' | 'cancelled';
  image_name?: string;
  log?: string[];
  commands?: { command: string, type: CommandType }[];
  sshAndVnc?: boolean;
  job?: Observable<any>;
}

export interface JobProcessEvent {
  build_id?: number;
  job_id?: number;
  repository_id?: number;
  type?: string;
  data?: string;
}

const config: any = getConfig();
export let jobProcesses: BehaviorSubject<JobProcess[]> = new BehaviorSubject([]);
export let jobEvents: BehaviorSubject<JobProcessEvent> = new BehaviorSubject({});
export let terminalEvents: Subject<JobProcessEvent> = new Subject();

jobEvents
  .filter(event => !!event.build_id && !!event.job_id)
  .subscribe(event => {
    let msg = [
      yellow('['),
      blue('abstruse_' + event.build_id + '_' + event.job_id),
      yellow(']'),
      ' --- ',
      yellow(event.data)
    ].join('');
    logger.info(msg);
  });

// main scheduler
const concurrency = config.concurrency || 10;
jobProcesses
  .mergeMap(procs => {
    procs = procs.filter(proc => proc.status !== 'cancelled');
    const running = procs.filter(proc => proc.status === 'running');
    if (running.length < concurrency) {
      let inQueue = procs.length - running.length;
      inQueue = inQueue >= concurrency ? concurrency : inQueue;
      procs = procs.filter(proc => proc.status !== 'running').slice(0, inQueue);
      return Observable.from(procs.map(proc => {
        proc.status = 'running';
        return Observable.fromPromise(startJob(proc));
      }));
    } else {
      return Observable.of([]);
    }
  })
  .subscribe();

// inserts new build into db and queue related jobs.
// returns inserted build id
export function startBuild(data: any): Promise<any> {
  let config: JobsAndEnv[];
  let pr = null;
  let sha = null;

  return getRepositoryOnly(data.repositories_id)
    .then(repository => {
      const isGithub = repository.github_id || false;
      const isBitbucket = repository.bitbucket_id || false;
      const isGitlab = repository.gitlab_id || false;
      const isGogs = repository.gogs_id || false;

      // TODO: add other git providers
      if (isGithub) {
        if (data.data.pull_request) {
          pr = data.data.pull_request.number;
          sha = data.data.pull_request.head.sha;
        } else {
          sha = data.data.after;
        }
      }

      const repo = { clone_url: repository.clone_url, branch: 'master', pr: pr, sha: sha };
      return getRemoteParsedConfig(repo);
    })
    .then(parsedConfig => config = parsedConfig)
    .then(() => data.parsed_config = config)
    .then(() => insertBuild(data))
    .then(build => {
      data = Object.assign(data, { build_id: build.id });
      delete data.repositories_id;
      delete data.pr;
      delete data.parsed_config;
      return insertBuildRun(data);
    })
    .then(() => getBuild(data.build_id))
    .then(buildData => sendPendingStatus(buildData, buildData.id))
    .then(() => {
      return config.reduce((prev, cfg, i) => {
        return prev.then(() => {
          let dataJob = null;

          return dbJob.insertJob({ data: JSON.stringify(cfg), builds_id: data.build_id })
            .then(job => dataJob = job)
            .then(() => getLastRunId(data.build_id))
            .then(lastRunId => {
              const jobRun = {
                start_time: new Date,
                status: 'queued',
                build_run_id: lastRunId,
                job_id: dataJob.id
              };

              return dbJobRuns.insertJobRun(jobRun);
            })
            .then(() => {
              jobEvents.next({
                type: 'process',
                build_id: data.build_id,
                job_id: dataJob.id,
                data: 'jobAdded'
              });

              return queueJob(data.build_id, dataJob.id);
            });
        });
      }, Promise.resolve());
    })
    .then(() => {
      jobEvents.next({
        type: 'process',
        build_id: data.build_id,
        repository_id: data.repositories_id,
        data: 'buildAdded'
      });
    }).catch(err => logger.error(err));
}

export function startJob(p: JobProcess): Promise<void> {
  return Promise.resolve()
    .then(() => {
      startBuildProcess(p.build_id, p.job_id, p.commands, 'abstruse', p.sshAndVnc)
        .subscribe(event => {
          const msg: JobProcessEvent = {
            build_id: p.build_id,
            job_id: p.job_id,
            type: event.type,
            data: event.data
          };

          terminalEvents.next(msg);
          if (event.data && event.type === 'data') {
            p.log.push(event.data);
          } else if (event.type === 'container') {
            let msg = [
              yellow('['),
              blue('abstruse_' + p.build_id + '_' + p.job_id),
              yellow(']'),
              ' --- ',
              yellow(event.data)
            ].join('');
            logger.info(msg);
          }
        }, err => {
          logger.error(err);

          dbJob.getLastRunId(p.job_id)
            .then(runId => {
              const data = {
                id: runId,
                end_time: new Date(),
                status: 'failed',
                log: p.log.join('')
              };

              return dbJobRuns.updateJobRun(data);
            })
            .then(() => getJobProcesses())
            .then(processes => {
              processes = processes.filter(proc => proc.job_id !== p.job_id);
              jobProcesses.next(processes);
              jobEvents.next({
                type: 'process',
                build_id: p.build_id,
                job_id: p.job_id,
                data: 'jobFailed'
              });

              if (processes.findIndex(proc => proc.build_id === p.build_id) === -1) {
                getBuild(p.build_id).then(build => sendFailureStatus(build, build.id));
              }
            })
            .catch(err => logger.error(err));
        }, () => {
          dbJob.getLastRunId(p.job_id)
            .then(runId => {
              const data = {
                id: runId,
                end_time: new Date(),
                status: 'success',
                log: p.log.join('')
              };

              return dbJobRuns.updateJobRun(data);
            })
            .then(() => getBuildStatus(p.build_id))
            .then(status => {
              if (status === 'success') {
                return updateBuild({ id: p.build_id, end_time: new Date() })
                  .then(() => getLastRunId(p.build_id))
                  .then(id => updateBuildRun({ id: id, end_time: new Date()} ))
                  .then(() => getBuild(p.build_id))
                  .then(build => sendSuccessStatus(build, build.id))
                  .catch(err => logger.error(err));
              } else if (status === 'failed') {
                getBuild(p.build_id)
                .then(build => sendFailureStatus(build, build.id));
              } else {
                return Promise.resolve();
              }
            })
            .then(() => getJobProcesses())
            .then(processes => {
              processes = processes.filter(proc => proc.job_id !== p.job_id);
              jobProcesses.next(processes);
              jobEvents.next({
                type: 'process',
                build_id: p.build_id,
                job_id: p.job_id,
                data: 'jobSucceded'
              });
            }).catch(err => logger.error(err));
        });
    })
    .then(() => dbJob.getLastRunId(p.job_id))
    .then(runId => {
      const data = { id: runId, start_time: new Date(), status: 'running', log: '' };
      return dbJobRuns.updateJobRun(data);
    })
    .then(() => {
      const data = { type: 'process', build_id: p.build_id, job_id: p.job_id, data: 'jobStarted' };
      jobEvents.next(data);
    })
    .catch(err => logger.error(err));
}

export function stopJob(jobId: number): Promise<any> {
  return getJobProcesses().then(processes => {
    const job = processes.find(proc => proc.job_id == jobId);
    if (!job) {
      return Promise.resolve()
        .then(() => dbJob.getLastRunId(jobId))
        .then(runId => dbJobRuns.getRun(runId))
        .then(jobRun => {
          if (jobRun.status !== 'success') {
            return dbJobRuns.updateJobRun({id: jobRun.id, end_time: new Date(), status: 'failed'});
          }
        })
        .then(() => dbJob.getJob(jobId))
        .then(job => {
          return stopContainer(`abstruse_${job.builds_id}_${jobId}`).toPromise()
            .then(() => getBuildStatus(job.builds_id))
            .then(status => {
              if (status === 'success') {
                getBuild(job.builds_id)
                  .then(build => sendSuccessStatus(build, build.id));
              } else if (status === 'failed') {
                getBuild(job.builds_id)
                .then(build => sendFailureStatus(build, build.id));
              }
            });
        })
        .catch(err => logger.error(err));
    } else {
      return Promise.resolve()
        .then(() => dbJob.getJob(jobId))
        .then(job => {
          return stopContainer(`abstruse_${job.builds_id}_${jobId}`).toPromise()
            .then(() => getBuildStatus(job.builds_id))
            .then(status => {
              if (status === 'success') {
                getBuild(job.builds_id)
                  .then(build => sendSuccessStatus(build, build.id));
              } else if (status === 'failed') {
                getBuild(job.builds_id)
                .then(build => sendFailureStatus(build, build.id));
              }
            });
        })
        .then(() => dbJob.getLastRunId(jobId))
        .then(runId => dbJobRuns.getRun(runId))
        .then(jobRun => {
          if (jobRun.status !== 'success') {
            return dbJobRuns.updateJobRun({id: jobRun.id, end_time: new Date(), status: 'failed' });
          }
        })
        .then(() => {
          jobEvents.next({
            type: 'process',
            build_id: job.build_id,
            job_id: job.job_id,
            data: 'jobStopped'
          });

          processes = processes.filter(proc => proc.job_id !== jobId);
          jobProcesses.next(processes);
        }).catch(err => logger.error(err));
    }
  }).catch(err => logger.error(err));
}

function queueJob(buildId: number, jobId: number, sshAndVnc = false): Promise<void> {
  let commands: string[] = null;
  let processes: JobProcess[] = null;

  return Promise.resolve()
    .then(() => getJobProcesses())
    .then(procs => processes = procs)
    .then(() => {
      const exists = processes.find(proc => proc.job_id === jobId);
      if (exists) {
        processes = processes.filter(proc => proc.job_id !== jobId);
        jobProcesses.next(processes);
        return stopJob(jobId);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => dbJob.getJob(jobId))
    .then(job => {
      const jobData = JSON.parse(job.data);

      const jobProcess: JobProcess = {
        build_id: buildId,
        job_id: jobId,
        status: 'queued',
        commands: jobData.commands,
        sshAndVnc: sshAndVnc,
        log: []
      };

      processes.push(jobProcess);
      jobProcesses.next(processes);
      jobEvents.next({ type: 'process', build_id: buildId, job_id: jobId, data: 'jobQueued' });
    }).catch(err => logger.error(err));
}

export function restartBuild(buildId: number): Promise<any> {
  let buildData;
  let accessToken;
  return stopBuild(buildId)
    .then(() => getBuild(buildId))
    .then(build => buildData = build)
    .then(() => accessToken = buildData.repository.access_token || null)
    .then(() => {
      let jobs = buildData.jobs;
      buildData.start_time = new Date();
      buildData.end_time = null;

      return updateBuild(buildData)
        .then(() => {
          buildData.build_id = buildId;
          return insertBuildRun(buildData);
        })
        .then(buildRun => {
          return Promise.all(jobs.map(job => {
            dbJobRuns.insertJobRun({
              start_time: new Date(),
              end_time: null,
              status: 'queued',
              log: '',
              build_run_id: buildRun.id,
              job_id: job.id
            });
          }));
        })
        .then(() => {
          return jobs.reduce((prev, curr) => {
            return prev.then(() => queueJob(buildId, curr.id));
          }, Promise.resolve());
        })
        .then(() => sendPendingStatus(buildData, buildData.id))
        .catch(err => logger.error(err));
    }).catch(err => logger.error(err));
}

export function stopBuild(buildId: number): Promise<any> {
  return getJobProcesses()
    .then(procs => {
        const processes = procs.slice();
        procs = procs.map(job => {
          if (job.build_id === buildId) {
            job.status = 'cancelled';
          }
          return job;
        });
        jobProcesses.next(procs);

        return processes.filter(job => job.build_id === buildId).reduce((prev, current) => {
          return prev.then(() => stopJob(current.job_id));
        }, Promise.resolve()).then(() => procs);
    })
    .catch(err => logger.error(err));
}

export function restartJob(jobId: number): Promise<void> {
  let jobData = null;
  return stopJob(jobId)
    .then(() => dbJob.getLastRun(jobId))
    .then(lastRun => dbJobRuns.insertJobRun({
      start_time: new Date(),
      end_time: null,
      status: 'queued',
      log: '',
      build_run_id: lastRun.build_run_id,
      job_id: jobId }))
    .then(() => dbJob.getJob(jobId))
    .then(job => jobData = job)
    .then(() => queueJob(jobData.builds_id, jobId))
    .then(() => {
      jobEvents.next({
        type: 'process',
        build_id: jobData.builds_id,
        job_id: jobData.id,
        data: 'jobRestarted'
      });
    })
    .then(() => getBuild(jobData.builds_id))
    .then(build => sendPendingStatus(build, build.id))
    .catch(err => logger.error(err));
}

export function restartJobWithSshAndVnc(jobId: number): Promise<void> {
  let jobData = null;
  return stopJob(jobId)
    .then(() => dbJob.getLastRun(jobId))
    .then(lastRun => dbJobRuns.insertJobRun({
      start_time: new Date(),
      end_time: null,
      status: 'queued',
      log: '',
      build_run_id: lastRun.build_run_id,
      job_id: jobId }))
    .then(() => dbJob.getJob(jobId))
    .then(job => jobData = job)
    .then(() => queueJob(jobData.builds_id, jobId, true))
    .then(() => {
      jobEvents.next({
        type: 'process',
        build_id: jobData.builds_id,
        job_id: jobData.id,
        data: 'jobRestarted'
      });
    })
    .then(() => getBuild(jobData.builds_id))
    .then(build => sendPendingStatus(build, build.id))
    .catch(err => logger.error(err));
}

export function startSetup(name: string): Promise<void> {
  return getJobProcesses()
    .then(procs => {
      const setup: JobProcess = {
        image_name: name,
        status: 'queued',
        job: queueSetupDockerImage(name),
        log: []
      };

      procs.push(setup);
      jobProcesses.next(procs);
    });
}

export function queueSetupDockerImage(name: string): Observable<any> {
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
        getJobProcesses()
          .then(procs => {
            procs = procs.filter(job => !job.image_name && job.image_name !== name);
            jobProcesses.next(procs);

            observer.complete();
          });
      }
    }, err => {
      logger.error(err);
    }, () => {
      observer.complete();
    });
  });

  return jobOutput;
}

export function findDockerImageBuildJob(name: string): Promise<JobProcess> {
  return getJobProcesses()
    .then(procs => {
      const dockerJob = procs.find(job => job.image_name && job.image_name === name);
      return dockerJob;
    });
}

export function getJobProcesses(): Promise<JobProcess[]> {
  return new Promise(resolve => {
    jobProcesses.subscribe(jobProcesses => resolve(jobProcesses));
  });
}
