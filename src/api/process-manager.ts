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
import { blue, yellow, green, cyan } from 'chalk';
import { getConfig, getHttpJsonResponse, getBitBucketAccessToken, prepareCommands } from './utils';
import { sendFailureStatus, sendPendingStatus, sendSuccessStatus } from './commit-status';
import { decrypt } from './security';
import { userId } from './socket';

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
  log?: string[];
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

const config: any = getConfig();
export let jobProcesses: Subject<JobProcess> = new Subject();
export let jobEvents: BehaviorSubject<JobProcessEvent> = new BehaviorSubject({});
export let terminalEvents: Subject<JobProcessEvent> = new Subject();
export let buildStatuses: Subject<any> = new Subject();
export let buildSub: { [id: number]: Subscription } = {};
export let processes: JobProcess[] = [];

jobEvents
  .filter(event => !!event.build_id && !!event.job_id)
  .share()
  .subscribe(event => {
    const msg: LogMessageType = {
      message: `[build]: build: ${event.build_id} job: ${event.job_id} => ${event.data}`,
      type: 'info',
      notify: false
    };

    logger.next(msg);
  });

// main scheduler
const concurrency = config.concurrency || 10;
jobProcesses
  .mergeMap(process => execJob(process), concurrency)
  .subscribe();

function execJob(proc: JobProcess): Observable<{}> {
  const index = processes.findIndex(process => process.job_id === proc.job_id);
  if (index !== -1) {
    processes[index] = proc;
  } else {
    processes.push(proc);
  }

  const buildProcesses = processes.filter(p => p.build_id === proc.build_id);
  if (proc.env.findIndex(e => e === 'DEPLOY') === -1 || buildProcesses.length === 1
    || !buildProcesses.filter(p => p.status != 'success' && p.job_id != proc.job_id).length) {
      return startJobProcess(proc);
  }

  return new Observable(observer => {
    return buildStatuses
      .filter(bs => bs.build_id === proc.build_id)
      .subscribe(event => {
        const testProcesses = processes.filter(p => {
          return p.build_id === proc.build_id && p.job_id != proc.job_id;
        });

        if (testProcesses.length) {
          if (proc.job_id != event.job_id) {
            const notSucceded = testProcesses.filter(p => p.status != 'success');
            const queuedOrRunning = testProcesses.filter(p => {
              return p.status === 'queued' || p.status === 'running';
            });
            if (!notSucceded.length) {
              startJobProcess(proc).subscribe(() => observer.complete());
            } else if (!queuedOrRunning.length) {
                stopJob(proc.job_id).then(() => observer.complete());
            }
          } else {
            observer.complete();
          }
        }
      });
  });
}

export function startJobProcess(proc: JobProcess): Observable<{}> {
  return new Observable(observer => {
    getRepositoryByBuildId(proc.build_id)
      .then(repository => {
        const envVariables: string[] = repository.variables.map(v => {
          if (!!v.encrypted) {
            return `${v.name}=${decrypt(v.value)}`;
          } else {
            return `${v.name}=${v.value}`;
          }
        });

        const jobTimeout = config.jobTimeout ? config.jobTimeout * 1000 : 3600000;
        const idleTimeout = config.idleTimeout ? config.idleTimeout * 1000 : 3600000;

        buildSub[proc.job_id] = startBuildProcess(proc, envVariables, jobTimeout, idleTimeout)
          .subscribe(event => {
            const msg: JobProcessEvent = {
              build_id: proc.build_id,
              job_id: proc.job_id,
              type: event.type,
              data: event.data
            };

            terminalEvents.next(msg);
            if (event.data && event.type === 'data') {
              proc.log.push(event.data);
            } else if (event.data && event.type === 'exposed ports') {
              proc.exposed_ports = event.data;
            } else if (event.type === 'container') {
              const ev: JobProcessEvent = {
                type: 'process',
                build_id: proc.build_id,
                job_id: proc.job_id,
                data: event.data
              };
              jobEvents.next(ev);
            } else if (event.type === 'exit') {
              proc.log.push(event.data);
              observer.complete();
            }
          }, err => {
            const msg: LogMessageType = {
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
        const time = new Date();
        const data = {
          id: runId, start_time: time, end_time: null, status: 'running', log: '' };
        return dbJobRuns.updateJobRun(data)
          .then(() => {
            const data = {
              type: 'process',
              build_id: proc.build_id,
              job_id: proc.job_id,
              data: 'job started',
              additionalData: time.getTime()
            };
            jobEvents.next(data);
          });
      })
      .catch(err => {
        const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
        logger.next(msg);
      });
  });
}

export function restartJob(jobId: number): Promise<void> {
  const time = new Date();
  let job = null;

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
      const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}


export function stopJob(jobId: number): Promise<void> {
  const time = new Date();

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
                  .then(id => updateBuildRun({ id: id, end_time: time} ))
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
                    const msg: LogMessageType = {
                      message: `[error]: ${err}`,
                      type: 'error',
                      notify: false
                    };
                    logger.next(msg);
                  });
              }).catch(err => {
                const msg: LogMessageType = {
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
                  .then(id => updateBuildRun({ id: id, end_time: time} ))
                  .then(() =>  sendFailureStatus(build, build.id))
                  .then(() => {
                    jobEvents.next({
                      type: 'process',
                      build_id: build.id,
                      data: 'build failed',
                      additionalData: time.getTime()
                    });
                  })
                  .catch(err => {
                    const msg: LogMessageType = {
                      message: `[error]: ${err}`,
                      type: 'error',
                      notify: false
                    };
                    logger.next(msg);
                  });
              }).catch(err => {
                const msg: LogMessageType = {
                  message: `[error]: ${err}`,
                  type: 'error',
                  notify: false
                };
                logger.next(msg);
              });
          }
        }).catch(err => {
          const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
          logger.next(msg);
        });
    })
    .then(() => dbJob.getLastRunId(jobId))
    .then(runId => dbJobRuns.getRun(runId))
    .then(jobRun => {
      if (!jobRun.end_time) {
        return dbJobRuns.updateJobRun({id: jobRun.id, end_time: time, status: 'failed' });
      }
    })
    .then(() => dbJob.getJob(jobId))
    .then(job => {
      const data = {
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
      const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

export function debugJob(jobId: number, debug: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    let process = processes.find(p => p.job_id === Number(jobId));
    process.debug = debug;
  });
}

export function startBuild(data: any, buildConfig?: any): Promise<any> {
  let config: JobsAndEnv[];
  let repoId = data.repositories_id;
  let pr = null;
  let sha = null;
  let branch = null;

  return getRepositoryOnly(data.repositories_id)
    .then(repository => {
      const isGithub = repository.github_id || false;
      const isBitbucket = repository.bitbucket_id || false;
      const isGitlab = repository.gitlab_id || false;
      const isGogs = repository.gogs_id || false;

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
          const push = data.data.push.changes[data.data.push.changes.length - 1];
          const commit = push.commits[push.commits.length - 1];
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

      const repo = {
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
    .then(parsedConfig => config = parsedConfig)
    .then(() => data.parsed_config = JSON.stringify(config))
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
    .then(buildData => {
      sendPendingStatus(buildData, buildData.id)
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
              .then(() => queueJob(dataJob.id));
          });
        }, Promise.resolve());
      })
      .then(() => getLastBuild(userId || null))
      .then(lastBuild => {
        jobEvents.next({
          type: 'process',
          build_id: data.build_id,
          repository_id: repoId,
          data: 'build added',
          additionalData: lastBuild
        });
      })
      .then(() => getDepracatedBuilds(buildData))
      .then(builds => Promise.all(builds.map(build => stopBuild(build))));
    })
    .catch(err => {
      const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

export function restartBuild(buildId: number): Promise<any> {
  const time = new Date();
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
          return jobs.reduce((prev, curr) => {
            return prev.then(() => {
              return stopJob(curr.id).then(() => queueJob(curr.id));
            });
          }, Promise.resolve());
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
          const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
          logger.next(msg);
        });
    }).catch(err => {
      const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

export function stopBuild(buildId: number): Promise<any> {
  return getBuild(buildId)
    .then(build => {
      const jobs = build.jobs;
      return jobs.reduce((prev, current) => {
        return prev.then(() => stopJob(current.id));
      }, Promise.resolve());
    })
    .catch(err => {
      const msg: LogMessageType = { message: `[error]: ${err}`, type: 'error', notify: false };
      logger.next(msg);
    });
}

function queueJob(jobId: number): Promise<void> {
  let job = null;
  return dbJob.getJob(jobId)
    .then(jobData => job = jobData)
    .then(() => {
      const data = JSON.parse(job.data);
      const jobProcess: JobProcess = {
        build_id: job.builds_id,
        job_id: jobId,
        status: 'queued',
        commands: data.commands,
        cache: data.cache || null,
        repo_name: job.build.repository.full_name || null,
        branch: job.build.branch || null,
        env: data.env,
        image_name: data.image,
        exposed_ports: null,
        log: [],
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
      const time = new Date();
      return dbJob.getLastRunId(proc.job_id)
        .then(runId => {
          const data = {
            id: runId,
            end_time: time,
            status: 'success',
            log: proc.log.join('')
          };

          return dbJobRuns.updateJobRun(data);
        })
        .then(() => getBuildStatus(proc.build_id))
        .then(status => {
          buildStatuses.next({status: status, build_id: proc.build_id, job_id: proc.job_id});

          if (status === 'success') {
            return updateBuild({ id: proc.build_id, end_time: time })
              .then(() => getLastRunId(proc.build_id))
              .then(id => updateBuildRun({ id: id, end_time: time} ))
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
              .then(id => updateBuildRun({ id: id, end_time: time} ))
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
          const msg: LogMessageType = {
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

          getLastRunId(proc.build_id).then(id => updateBuildRun({ id: id, end_time: time} ));
          Promise.resolve();
        });
    });
}

function jobFailed(proc: JobProcess, msg?: LogMessageType): Promise<any> {
  return Promise.resolve()
    .then(() => {
      proc.status = 'errored';
      const time = new Date();
      if (msg) {
        logger.next(msg);
      }

      return dbJob.getLastRunId(proc.job_id)
        .then(runId => {
          const data = {
            id: runId,
            end_time: time,
            status: 'failed',
            log: proc.log.join('')
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

          buildStatuses.next({
            status: 'errored',
            build_id: proc.build_id,
            job_id: proc.job_id
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
          const msg: LogMessageType = {
            message: `[error]: ${err}`, type: 'error', notify: false
          };
          logger.next(msg);
          Promise.resolve();
        });
    });
}
