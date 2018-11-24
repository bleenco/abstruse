import { startBuildProcess } from './process';
import { Observable, Subject, BehaviorSubject, Subscription, from, timer } from 'rxjs';
import { filter, mergeMap, share, map } from 'rxjs/operators';
import {
  insertBuild,
  updateBuild,
  getBuild,
  getBuildStatus,
  getLastRunId,
  getDepracatedBuilds,
} from './db/build';
import { insertBuildRun, updateBuildRun } from './db/build-run';
import * as dbJob from './db/job';
import * as dbJobRuns from './db/job-run';
import { getRepositoryOnly, getRepositoryByBuildId } from './db/repository';
import { getRemoteParsedConfig, JobsAndEnv, CommandType } from './config';
import { killContainer } from './docker';
import { logger, LogMessageType } from './logger';
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

const config: any = getConfig();
export let jobProcesses: Subject<JobProcess> = new Subject();
export let jobEvents: BehaviorSubject<JobProcessEvent> = new BehaviorSubject({});
export let terminalEvents: Subject<JobProcessEvent> = new Subject();
export let buildSub: { [id: number]: Subscription } = {};
export let processes: JobProcess[] = [];
export let scheduler: Subscription;

jobEvents
  .pipe(
    filter(event => !!event.build_id && !!event.job_id),
    share()
  )
  .subscribe(event => {
    const msg: LogMessageType = {
      message: `[build]: build: ${event.build_id} job: ${event.job_id} => ${event.data}`,
      type: 'info',
      notify: false
    };

    logger.next(msg);
  });

export function startScheduler(): void {
  scheduler = jobProcesses
    .pipe(
      mergeMap(process => execJob(process), config.concurrency || 10)
    )
    .subscribe();
}

export function stopScheduler(): void {
  if (scheduler) {
    scheduler.unsubscribe();
  }
}

function execJob(proc: JobProcess): Observable<any> {
  const index = processes.findIndex(process => process.job_id === proc.job_id);
  if (index !== -1) {
    processes[index] = proc;
  } else {
    processes.push(proc);
  }

  const buildProcesses = processes.filter(p => p.build_id === proc.build_id);
  const testProcesses = buildProcesses.filter(process => {
    return process.env.findIndex(e => e === 'DEPLOY') === -1;
  });
  const queuedOrRunning = testProcesses.filter(p => {
    return p.status === 'queued' || p.status === 'running';
  });
  const succeded = testProcesses.filter(p => p.status === 'success');
  const isDeploy = proc.env.findIndex(e => e === 'DEPLOY') !== -1 ? true : false;

  if (!isDeploy || succeded.length === testProcesses.length) {
    return startJobProcess(proc);
  } else if (queuedOrRunning.length) {
    // give some time (5s) to check again other processes
    return timer(5000).pipe(map(() => jobProcesses.next(proc)));
  } else {
    return from(stopJob(proc.job_id));
  }
}

export function startJobProcess(proc: JobProcess): Observable<{}> {
  return new Observable(observer => {
    getRepositoryByBuildId(proc.build_id)
      .then(repository => {
        const envs = envVars.generate(proc);
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

        const jobTimeout = config.jobTimeout ? config.jobTimeout * 1000 : 3600000;
        const idleTimeout = config.idleTimeout ? config.idleTimeout * 1000 : 3600000;

        buildSub[proc.job_id] =
          startBuildProcess(proc, envs, jobTimeout, idleTimeout)
            .subscribe(event => {
              const msg: JobProcessEvent = {
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
                const ev: JobProcessEvent = {
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
              const msg: LogMessageType = {
                message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
              };
              jobFailed(proc, msg)
                .then(() => observer.complete());
            }, () => {
              jobSucceded(proc)
                .then(() => observer.complete());
            });
      })
      .then(() => dbJob.getLastRunId(proc.job_id))
      .then(async runId => {
        const time = new Date();
        const data = { id: runId, start_time: time, end_time: null, status: 'running', log: '' };
        return dbJobRuns.updateJobRun(data)
          .then(() => {
            const jobRunData = {
              type: 'process',
              build_id: proc.build_id,
              job_id: proc.job_id,
              data: 'job started',
              additionalData: time.getTime()
            };
            jobEvents.next(jobRunData);
          })
          .catch(err => Promise.reject(err));
      })
      .catch(err => {
        const msg: LogMessageType = {
          message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
        };
        logger.next(msg);
      });
  });
}

export async function restartJob(jobId: number): Promise<void> {
  const time = new Date();
  const process = processes.find(p => p.job_id === Number(jobId));
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

  await stopJob(jobId);
  const lastRun = await dbJob.getLastRun(jobId);
  await dbJobRuns.insertJobRun({
    start_time: time,
    end_time: null,
    status: 'queued',
    log: '',
    build_run_id: lastRun.build_run_id,
    job_id: jobId
  });
  await queueJob(jobId);
  const job = await dbJob.getJob(jobId);

  jobEvents.next({
    type: 'process',
    build_id: job.builds_id,
    job_id: job.id,
    data: 'job restarted',
    additionalData: time.getTime()
  });

  const build = await getBuild(job.builds_id);
  await sendPendingStatus(build, build.id);
}


export async function stopJob(jobId: number): Promise<void> {
  const time = new Date();
  const process = processes.find(p => p.job_id === Number(jobId));
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

  let job = await dbJob.getJob(jobId);
  await killContainer(`abstruse_${job.builds_id}_${jobId}`);
  const status = await getBuildStatus(job.builds_id);

  if (status === 'success') {
    const build = await getBuild(job.builds_id);
    await updateBuild({ id: build.id, end_time: time });
    const id = await getLastRunId(build.id);
    await updateBuildRun({ id, end_time: time });
    await sendSuccessStatus(build, build.id);

    jobEvents.next({
      type: 'process',
      build_id: build.id,
      data: 'build succeeded',
      additionalData: time.getTime()
    });
  } else if (status === 'failed') {
    const build = await getBuild(job.builds_id);
    await updateBuild({ id: build.id, end_time: time });
    const id = await getLastRunId(build.id);
    await updateBuildRun({ id, end_time: time });
    await sendFailureStatus(build, build.id);

    jobEvents.next({
      type: 'process',
      build_id: build.id,
      data: 'build failed',
      additionalData: time.getTime()
    });
  }

  const runId = await dbJob.getLastRunId(jobId);
  const jobRun = await dbJobRuns.getRun(runId);
  if (!jobRun.end_time) {
    await dbJobRuns.updateJobRun({ id: jobRun.id, end_time: time, status: 'failed' });
  }
  job = await dbJob.getJob(jobId);

  const data = {
    type: 'process',
    build_id: job.builds_id,
    job_id: job.id,
    data: 'job stopped',
    additionalData: time.getTime()
  };
  jobEvents.next(data);

  if (buildSub[jobId]) {
    buildSub[jobId].unsubscribe();
    delete buildSub[jobId];
  }
}

export function debugJob(jobId: number, debug: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = processes.find(p => p.job_id === Number(jobId));
    process.debug = debug;

    if (debug) {
      buildSub[jobId].unsubscribe();
      delete buildSub[jobId];

      const msg: JobProcessEvent = {
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

export async function startBuild(data: any, buildConfig?: any): Promise<any> {
  let cfg: JobsAndEnv[];
  const repoId = data.repositories_id;
  let pr = null;
  let sha = null;
  let branch = null;

  const repository = await getRepositoryOnly(data.repositories_id);
  const isGithub = repository.github_id ? true : false;
  const isBitbucket = repository.bitbucket_id ? true : false;
  const isGitlab = repository.gitlab_id ? true : false;
  const isGogs = repository.gogs_id ? true : false;

  if (isGithub) {
    if (data.data.pull_request) {
      pr = data.data.pull_request.number;
      sha = data.data.pull_request.head.sha;
      branch = data.data.pull_request.base.ref;
    } else {
      sha = data.data.after || data.data.sha;
      if (data.data && data.data.ref) {
        branch = data.data.ref.replace('refs/heads/', '');
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
  } else if (isGogs) {
    // TODO: implement this!
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

  if (!buildConfig) {
    cfg = await getRemoteParsedConfig(repo);
  } else {
    cfg = buildConfig;
  }

  data.parsed_config = cfg;
  data = Object.assign(data, { branch: branch, pr: pr });
  const build = await insertBuild(data);
  data = Object.assign(data, { build_id: build.id });
  delete data.repositories_id;
  delete data.pr;
  delete data.parsed_config;
  await insertBuildRun(data);

  const buildData = await getBuild(data.build_id);
  await sendPendingStatus(buildData, buildData.id);

  await cfg.reduce(async (prev, c) => {
    await prev.then(async () => {
      const job = await dbJob.insertJob({ data: c, builds_id: data.build_id });
      const lastRunId = await getLastRunId(data.build_id);
      const jobRun = {
        start_time: new Date,
        status: 'queued',
        build_run_id: lastRunId,
        job_id: job.id
      };
      await dbJobRuns.insertJobRun(jobRun);
      await queueJob(job.id);
    });
  }, Promise.resolve());

  jobEvents.next({
    type: 'process',
    build_id: data.build_id,
    repository_id: repoId,
    data: 'build added',
    additionalData: null
  });

  // const builds = await getDepracatedBuilds(buildData);
  // await Promise.all(builds.map(b => stopBuild(b)));

  return ({ buildId: buildData.id });
}

export async function restartBuild(buildId: number): Promise<any> {
  const time = new Date();
  let buildData;
  let accessToken;

  return stopBuild(buildId)
    .then(() => getBuild(buildId))
    .then(build => buildData = build)
    .then(() => accessToken = buildData.repository.access_token || null)
    .then(async () => {
      const jobs = buildData.jobs;
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
            return prev.then(async () => {
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
          const msg: LogMessageType = {
            message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
          };
          logger.next(msg);
        });
    })
    .catch(err => {
      const msg: LogMessageType = {
        message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
      };
      logger.next(msg);
    });
}

export async function stopBuild(buildId: number): Promise<any> {
  return getBuild(buildId)
    .then(build => {
      return build.jobs.reduce((prev, current) => {
        return prev.then(() => stopJob(current.id));
      }, Promise.resolve());
    })
    .catch(err => {
      const msg: LogMessageType = {
        message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
      };
      logger.next(msg);
    });
}

async function queueJob(jobId: number): Promise<void> {
  let job = null;
  let requestData = null;

  return dbJob.getJob(jobId)
    .then(jobData => job = jobData)
    .then(() => getBuild(job.builds_id))
    .then(build => requestData = { branch: build.branch, pr: build.pr, data: build.data })
    .then(() => {
      const data = job.data;
      const jobProcess: JobProcess = {
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
    }).catch(err => Promise.reject(err));
}

async function jobSucceded(proc: JobProcess): Promise<any> {
  return Promise.resolve()
    .then(async () => {
      proc.status = 'success';
      const time = new Date();
      return dbJob.getLastRunId(proc.job_id)
        .then(runId => {
          const data = {
            id: runId,
            end_time: time,
            status: 'success',
            log: proc.log
          };

          return dbJobRuns.updateJobRun(data);
        })
        .then(() => getBuildStatus(proc.build_id))
        .then(async status => {
          if (status === 'success') {
            return getLastRunId(proc.build_id)
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
              }).catch(err => Promise.reject(err));
          } else if (status === 'failed') {
            return getLastRunId(proc.build_id)
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
              }).catch(err => Promise.reject(err));
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
        .catch(async err => {
          const msg: LogMessageType = {
            message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
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
    }).catch(err => Promise.reject(err));
}

async function jobFailed(proc: JobProcess, msg?: LogMessageType): Promise<any> {
  return Promise.resolve()
    .then(async () => {
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
            log: proc.log
          };

          return dbJobRuns.updateJobRun(data);
        })
        .then(() => updateBuild({ id: proc.build_id, end_time: time }))
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
          const logMessage: LogMessageType = {
            message: typeof err === 'object' ? `[error]: ${JSON.stringify(err)}` : `[error]: ${err}`, type: 'error', notify: false
          };
          logger.next(logMessage);
        });
    }).catch(err => Promise.reject(err));
}
