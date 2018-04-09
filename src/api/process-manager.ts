import { startBuildProcess } from './process';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import {
  insertBuild,
  updateBuild,
  getBuild,
  getBuildStatus,
  getLastRunId,
  getDepracatedBuilds,
  getLastBuild
} from './db/build';
import { insertBuildRun, updateBuildRun } from './db/build-run';
import * as dbJob from './db/job';
import * as dbJobRuns from './db/job-run';
import { getRepositoryOnly, getRepositoryByBuildId } from './db/repository';
import { getRemoteParsedConfig, JobsAndEnv, CommandType } from './config';
import { killContainer } from './docker';
import { logger, LogMessageType } from './logger';
import { getHttpJsonResponse, getBitBucketAccessToken } from './utils';
import { getConfig } from './setup';
import { sendFailureStatus, sendPendingStatus, sendSuccessStatus } from './commit-status';
import { decrypt } from './security';
import * as envVars from './env-variables';

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
  status?: 'queued' | 'running' | 'cancelled' | 'errored' | 'success';
  image_name?: string;
  log?: string;
  requestData: any;
  commands?: { command: string, type: CommandType }[];
  cache?: string[];
  repo_name?: string;
  branch?: string;
  env?: string[];
  job?: Observable<any>;
  exposed_ports?: string;
  debug?: boolean;
}

export interface JobProcessEvent {
  build_id?: number;
  job_id?: number;
  repository_id?: number;
  type?: string;
  data?: string;
  additionalData?: any;
}

let config: any = getConfig();
export let jobProcesses: Subject<JobProcess> = new Subject();
export let jobEvents: BehaviorSubject<JobProcessEvent> = new BehaviorSubject({});
export let terminalEvents: Subject<JobProcessEvent> = new Subject();
export let buildSub: { [id: number]: Subscription } = {};
export let processes: JobProcess[] = [];

jobEvents
  .filter(event => !!event.build_id && !!event.job_id)
  .share()
  .subscribe(event => {
    let msg: LogMessageType = {
      message: `[build]: build: ${event.build_id} job: ${event.job_id} => ${event.data}`,
      type: 'info',
      notify: false
    };

    logger.next(msg);
  });

// main scheduler
let concurrency = config.concurrency || 10;
jobProcesses
  .mergeMap(process => execJob(process), concurrency)
  .subscribe();

function execJob(proc: JobProcess): Observable<any> {
  let index = processes.findIndex(process => process.job_id === proc.job_id);
  if (index !== -1) {
    processes[index] = proc;
  } else {
    processes.push(proc);
  }

  let buildProcesses = processes.filter(p => p.build_id === proc.build_id);
  let testProcesses = buildProcesses.filter(p => {
    return p.env.findIndex(e => e === 'DEPLOY') === -1;
  });
  let queuedOrRunning = testProcesses.filter(p => {
    return p.status === 'queued' || p.status === 'running';
  });
  let succeded = testProcesses.filter(p => p.status === 'success');
  let isDeploy = proc.env.findIndex(e => e === 'DEPLOY') !== -1 ? true : false;

  if (!isDeploy || succeded.length === testProcesses.length) {
    return startJobProcess(proc);
  } else if (queuedOrRunning.length) {
    // give some time (5s) to check again other processes
    return Observable.timer(5000).map(() => jobProcesses.next(proc));
  } else {
    return Observable.fromPromise(stopJob(proc.job_id));
  }
}

export function startJobProcess(proc: JobProcess): Observable<{}> {
  return new Observable(observer => {
    getRepositoryByBuildId(proc.build_id)
      .then(repository => {
        let envs = envVars.generate(proc);
        let secureVarirables = false;
        repository.variables.forEach(v => {
          if (!!v.encrypted) {
            secureVarirables = true;
            envVars.set(envs, v.name, decrypt(v.value), true);
          } else {
            envVars.set(envs, v.name, v.value);
          }
        });

        envVars.set(envs, 'ABSTRUSE_SECURE_ENV_VARS', secureVarirables);

        let jobTimeout = config.jobTimeout ? config.jobTimeout * 1000 : 3600000;
        let idleTimeout = config.idleTimeout ? config.idleTimeout * 1000 : 3600000;

        buildSub[proc.job_id] =
          startBuildProcess(proc, envs, jobTimeout, idleTimeout)
            .subscribe(event => {
              let msg: JobProcessEvent = {
                build_id: proc.build_id,
                job_id: proc.job_id,
                type: event.type,
                data: event.data
              };

              terminalEvents.next(msg);
              if (event.data && event.type === 'data') {
                proc.log += event.data;
              } else if (event.data && event.type === 'exposed ports') {
                proc.exposed_ports = event.data;
              } else if (event.type === 'container') {
                let ev: JobProcessEvent = {
                  type: 'process',
                  build_id: proc.build_id,
                  job_id: proc.job_id,
                  data: event.data
                };
                jobEvents.next(ev);
              } else if (event.type === 'exit') {
                proc.log += event.data;
                observer.complete();
              }
            }, err => {
              let msg: LogMessageType = {
                message: `[error]: ${err}`, type: 'error', notify: false
              };
              jobFailed(proc, msg)
                .then(() => observer.complete());
            }, () => {
              jobSucceded(proc)
                .then(() => observer.complete());
            });
      })
      .then(() => dbJob.getLastRunId(proc.job_id))
      .then(runId => {
        let time = new Date();
        let data = { id: runId, start_time: time, end_time: null, status: 'running', log: '' };
        return dbJobRuns.updateJobRun(data)
          .then(() => {
            let runData = {
              type: 'process',
              build_id: proc.build_id,
              job_id: proc.job_id,
              data: 'job started',
              additionalData: time.getTime()
            };
            jobEvents.next(runData);
          });
      })
      .catch(err => {
        let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
        logger.next(msg);
      });
  });
}

export function restartJob(jobId: number): Promise<void> {
  let time = new Date();
  let job = null;
  let process = processes.find(p => p.job_id === Number(jobId));
  if (process && process.debug) {
    process.debug = false;
    jobEvents.next({
      type: 'process',
      build_id: process.build_id,
      job_id: jobId,
      data: 'job failed',
      additionalData: time.getTime()
    });

    jobEvents.next({
      type: 'debug',
      build_id: process.build_id,
      job_id: jobId,
      data: 'false'
    });
  }

  return stopJob(jobId)
    .then(() => dbJob.getLastRun(jobId))
    .then(lastRun => dbJobRuns.insertJobRun({
      start_time: time,
      end_time: null,
      status: 'queued',
      log: '',
      build_run_id: lastRun.build_run_id,
      job_id: jobId
    }))
    .then(() => queueJob(jobId))
    .then(() => dbJob.getJob(jobId))
    .then(j => job = j)
    .then(() => {
      jobEvents.next({
        type: 'process',
        build_id: job.builds_id,
        job_id: job.id,
        data: 'job restarted',
        additionalData: time.getTime()
      });
    })
    .then(() => getBuild(job.builds_id))
    .then(build => sendPendingStatus(build, build.id))
    .catch(err => {
      let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}


export function stopJob(jobId: number): Promise<void> {
  let time = new Date();
  let process = processes.find(p => p.job_id === Number(jobId));
  if (process && process.debug) {
    process.debug = false;
    jobEvents.next({
      type: 'process',
      build_id: process.build_id,
      job_id: jobId,
      data: 'job failed',
      additionalData: time.getTime()
    });

    jobEvents.next({
      type: 'debug',
      build_id: process.build_id,
      job_id: jobId,
      data: 'false'
    });
  }

  return Promise.resolve()
    .then(() => dbJob.getJob(jobId))
    .then(job => {
      return killContainer(`abstruse_${job.builds_id}_${jobId}`)
        .then(() => getBuildStatus(job.builds_id))
        .then(status => {
          if (status === 'success') {
            return getBuild(job.builds_id)
              .then(build => {
                return updateBuild({ id: build.id, end_time: time })
                  .then(() => getLastRunId(build.id))
                  .then(id => updateBuildRun({ id: id, end_time: time }))
                  .then(() => sendSuccessStatus(build, build.id))
                  .then(() => {
                    jobEvents.next({
                      type: 'process',
                      build_id: build.id,
                      data: 'build succeeded',
                      additionalData: time.getTime()
                    });
                  })
                  .catch(err => {
                    let msg: LogMessageType = {
                      message: `[error]: ${err}`,
                      type: 'error',
                      notify: false
                    };
                    logger.next(msg);
                  });
              }).catch(err => {
                let msg: LogMessageType = {
                  message: `[error]: ${err}`,
                  type: 'error',
                  notify: false
                };
                logger.next(msg);
              });
          } else if (status === 'failed') {
            return getBuild(job.builds_id)
              .then(build => {
                return updateBuild({ id: build.id, end_time: time })
                  .then(() => getLastRunId(build.id))
                  .then(id => updateBuildRun({ id: id, end_time: time }))
                  .then(() => sendFailureStatus(build, build.id))
                  .then(() => {
                    jobEvents.next({
                      type: 'process',
                      build_id: build.id,
                      data: 'build failed',
                      additionalData: time.getTime()
                    });
                  })
                  .catch(err => {
                    let msg: LogMessageType = {
                      message: `[error]: ${err}`,
                      type: 'error',
                      notify: false
                    };
                    logger.next(msg);
                  });
              }).catch(err => {
                let msg: LogMessageType = {
                  message: `[error]: ${err}`,
                  type: 'error',
                  notify: false
                };
                logger.next(msg);
              });
          }
        }).catch(err => {
          let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
          logger.next(msg);
        });
    })
    .then(() => dbJob.getLastRunId(jobId))
    .then(runId => dbJobRuns.getRun(runId))
    .then(jobRun => {
      if (!jobRun.end_time) {
        return dbJobRuns.updateJobRun({ id: jobRun.id, end_time: time, status: 'failed' });
      }
    })
    .then(() => dbJob.getJob(jobId))
    .then(job => {
      let data = {
        type: 'process',
        build_id: job.builds_id,
        job_id: job.id,
        data: 'job stopped',
        additionalData: time.getTime()
      };
      jobEvents.next(data);
    }).then(() => {
      if (buildSub[jobId]) {
        buildSub[jobId].unsubscribe();
        delete buildSub[jobId];
      }
    }).catch(err => {
      let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

export function debugJob(jobId: number, debug: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    let time = new Date();
    let process = processes.find(p => p.job_id === Number(jobId));
    process.debug = debug;

    if (debug) {
      buildSub[jobId].unsubscribe();
      delete buildSub[jobId];

      let msg: JobProcessEvent = {
        build_id: process.build_id,
        job_id: Number(jobId),
        type: 'data',
        data: `[exectime]: stopped`
      };

      terminalEvents.next(msg);
      process.log += `[exectime]: stopped`;
    }
  });
}

export function startBuild(data: any, buildConfig?: any): Promise<any> {
  let jobConfig: JobsAndEnv[];
  let repoId = data.repositories_id;
  let pr = null;
  let sha = null;
  let branch = null;
  let buildData = null;

  return getRepositoryOnly(data.repositories_id)
    .then(repository => {
      let isGithub = repository.github_id || false;
      let isBitbucket = repository.bitbucket_id || false;
      let isGitlab = repository.gitlab_id || false;
      let isGogs = repository.gogs_id || false;

      if (isGithub) {
        if (data.data.pull_request) {
          pr = data.data.pull_request.number;
          sha = data.data.pull_request.head.sha;
          branch = data.data.pull_request.base.ref;
        } else {
          sha = data.data.after || data.data.sha;
          if (data.data && data.data.ref) {
            branch = data.data.ref.split('/').pop();
          }
        }
      } else if (isBitbucket) {
        if (data.data.push) {
          let push = data.data.push.changes[data.data.push.changes.length - 1];
          let commit = push.commits[push.commits.length - 1];
          sha = commit.hash;
          branch = push.new.type === 'branch' ? push.new.name : 'master';
        } else if (data.data.pullrequest) {
          pr = data.data.pullrequest.id;
          sha = data.data.pullrequest.source.commit.hash;
          branch = data.data.pullrequest.source.branch.name;
        } else if (data.hash) {
          sha = data.data.hash;
        }
      } else if (isGitlab) {
        if (data.data.name) {
          sha = data.data.commit.id;
          branch = data.data.name;
        }
      }

      branch = branch || repository.default_branch || 'master';

      let repo = {
        clone_url: repository.clone_url,
        branch: branch,
        pr: pr,
        sha: sha,
        access_token: repository.access_token || null,
        type: repository.repository_provider
      };

      if (buildConfig) {
        return Promise.resolve(buildConfig);
      } else {
        return getRemoteParsedConfig(repo);
      }
    })
    .then(parsedConfig => jobConfig = parsedConfig)
    .then(() => data.parsed_config = JSON.stringify(jobConfig))
    .then(() => data = Object.assign(data, { branch: branch, pr: pr }))
    .then(() => insertBuild(data))
    .then(build => {
      data = Object.assign(data, { build_id: build.id });
      delete data.repositories_id;
      delete data.pr;
      delete data.parsed_config;
      return insertBuildRun(data);
    })
    .then(() => getBuild(data.build_id))
    .then(bdata => buildData = bdata)
    .then(() => sendPendingStatus(buildData, buildData.id))
    .then(() => {
      return Promise.all(jobConfig.map(cfg => {
        let dataJob = null;
        return dbJob.insertJob({ data: JSON.stringify(cfg), builds_id: data.build_id })
          .then(job => dataJob = job)
          .then(() => getLastRunId(data.build_id))
          .then(lastRunId => {
            let jobRun = {
              start_time: new Date,
              status: 'queued',
              build_run_id: lastRunId,
              job_id: dataJob.id
            };
            return dbJobRuns.insertJobRun(jobRun);
          }).then(() => queueJob(dataJob.id));
      }));
    })
    .then(lastBuild => {
      jobEvents.next({
        type: 'process',
        build_id: data.build_id,
        repository_id: repoId,
        data: 'build added',
        additionalData: null
      });
    })
    .then(() => getDepracatedBuilds(buildData))
    .then(builds => Promise.all(builds.map(build => stopBuild(build))))
    .then(() => ({ buildId: buildData.id }))
    .catch(err => {
      let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

export function restartBuild(buildId: number): Promise<any> {
  let time = new Date();
  let buildData;
  let accessToken;

  return stopBuild(buildId)
    .then(() => getBuild(buildId))
    .then(build => buildData = build)
    .then(() => accessToken = buildData.repository.access_token || null)
    .then(() => {
      let jobs = buildData.jobs;
      buildData.start_time = time;
      buildData.end_time = null;

      return updateBuild(buildData)
        .then(() => {
          buildData.build_id = buildId;
          return insertBuildRun(buildData);
        })
        .then(buildRun => {
          return Promise.all(jobs.map(job => {
            dbJobRuns.insertJobRun({
              start_time: time,
              end_time: null,
              status: 'queued',
              log: '',
              build_run_id: buildRun.id,
              job_id: job.id
            });
          }));
        })
        .then(() => {
          return Promise.all(jobs.map(job => stopJob(job.id).then(() => queueJob(job.id))));
        })
        .then(() => getBuild(buildId))
        .then(build => sendPendingStatus(build, build.id))
        .then(() => {
          jobEvents.next({
            type: 'process',
            build_id: buildId,
            data: 'build restarted',
            additionalData: time.getTime()
          });
        })
        .catch(err => {
          let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
          logger.next(msg);
        });
    }).catch(err => {
      let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

export function stopBuild(buildId: number): Promise<any> {
  return getBuild(buildId)
    .then(build => Promise.all(build.jobs.map(job => stopJob(job.id))))
    .catch(err => {
      let msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

function queueJob(jobId: number): Promise<void> {
  let job = null;
  let requestData = null;

  return dbJob.getJob(jobId)
    .then(jobData => job = jobData)
    .then(() => getBuild(job.builds_id))
    .then(build => requestData = { branch: build.branch, pr: build.pr, data: build.data })
    .then(() => {
      let data = JSON.parse(job.data);
      let jobProcess: JobProcess = {
        build_id: job.builds_id,
        job_id: jobId,
        status: 'queued',
        requestData: requestData,
        commands: data.commands,
        cache: data.cache || null,
        repo_name: job.build.repository.full_name || null,
        branch: job.build.branch || null,
        env: data.env,
        image_name: data.image,
        exposed_ports: null,
        log: '',
        debug: false
      };

      jobProcesses.next(jobProcess);
      jobEvents.next({
        type: 'process',
        build_id: job.builds_id,
        job_id: job.id,
        data: 'job queued'
      });
    });
}

function jobSucceded(proc: JobProcess): Promise<any> {
  return Promise.resolve()
    .then(() => {
      proc.status = 'success';
      let time = new Date();
      return dbJob.getLastRunId(proc.job_id)
        .then(runId => {
          let data = {
            id: runId,
            end_time: time,
            status: 'success',
            log: proc.log
          };

          return dbJobRuns.updateJobRun(data);
        })
        .then(() => getBuildStatus(proc.build_id))
        .then(status => {
          if (status === 'success') {
            return updateBuild({ id: proc.build_id, end_time: time })
              .then(() => getLastRunId(proc.build_id))
              .then(id => updateBuildRun({ id: id, end_time: time }))
              .then(() => getBuild(proc.build_id))
              .then(build => sendSuccessStatus(build, build.id))
              .then(() => {
                jobEvents.next({
                  type: 'process',
                  build_id: proc.build_id,
                  data: 'build succeeded',
                  additionalData: time.getTime()
                });
              });
          } else if (status === 'failed') {
            return getBuild(proc.build_id)
              .then(build => updateBuild({ id: proc.build_id, end_time: time }))
              .then(() => getLastRunId(proc.build_id))
              .then(id => updateBuildRun({ id: id, end_time: time }))
              .then(() => getBuild(proc.build_id))
              .then(build => sendFailureStatus(build, build.id))
              .then(() => {
                jobEvents.next({
                  type: 'process',
                  build_id: proc.build_id,
                  data: 'build failed',
                  additionalData: time.getTime()
                });
              });
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          jobEvents.next({
            type: 'process',
            build_id: proc.build_id,
            job_id: proc.job_id,
            data: 'job succeded',
            additionalData: time.getTime()
          });
        })
        .catch(err => {
          let msg: LogMessageType = {
            message: `[error]: ${err}`, type: 'error', notify: false
          };
          logger.next(msg);

          jobEvents.next({
            type: 'process',
            build_id: proc.build_id,
            job_id: proc.job_id,
            data: 'job failed',
            additionalData: time.getTime()
          });

          return getLastRunId(proc.build_id)
            .then(id => updateBuildRun({ id: id, end_time: time }));
        });
    });
}

function jobFailed(proc: JobProcess, msg?: LogMessageType): Promise<any> {
  return Promise.resolve()
    .then(() => {
      proc.status = 'errored';
      let time = new Date();
      if (msg) {
        logger.next(msg);
      }

      return dbJob.getLastRunId(proc.job_id)
        .then(runId => {
          let data = {
            id: runId,
            end_time: time,
            status: 'failed',
            log: proc.log
          };

          return dbJobRuns.updateJobRun(data);
        })
        .then(build => updateBuild({ id: proc.build_id, end_time: time }))
        .then(id => updateBuildRun({ id: id, end_time: time }))
        .then(() => getBuild(proc.build_id))
        .then(build => sendFailureStatus(build, build.id))
        .then(() => {
          jobEvents.next({
            type: 'process',
            build_id: proc.build_id,
            data: 'build failed',
            additionalData: time.getTime()
          });
        })
        .then(() => {
          jobEvents.next({
            type: 'process',
            build_id: proc.build_id,
            job_id: proc.job_id,
            data: 'job failed',
            additionalData: time.getTime()
          });
        })
        .catch(err => {
          let jobMsg: LogMessageType = {
            message: `[error]: ${err}`, type: 'error', notify: false
          };
          logger.next(jobMsg);
        });
    });
}
