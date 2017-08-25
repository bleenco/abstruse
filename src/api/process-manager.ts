import { startDockerImageSetupJob, startBuildProcess } from './process';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { insertBuild, updateBuild, getBuild, getBuildStatus, getLastRunId } from './db/build';
import { insertBuildRun, updateBuildRun } from './db/build-run';
import * as dbJob from './db/job';
import * as dbJobRuns from './db/job-run';
import { getRepositoryOnly } from './db/repository';
import { getRepositoryDetails, generateCommands } from './config';
import { killContainer } from './docker';
import * as logger from './logger';
import { blue, yellow, green, cyan } from 'chalk';
import { getConfig, getHttpJsonResponse, getBitBucketAccessToken } from './utils';
import {
  setGitHubStatusError,
  setGitHubStatusFailure,
  setGitHubStatusPending,
  setGitHubStatusSuccess,
  setBitbucketStatusFailure,
  setBitbucketStatusPending,
  setBitbucketStatusSuccess,
  setGitLabStatusError,
  setGitLabStatusFailure,
  setGitLabStatusPending,
  setGitLabStatusSuccess
} from './commit-status';

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
  status?: 'queued' | 'running' | 'completed';
  image_name?: string;
  job?: Subject<JobMessage> | Observable<JobMessage> | any;
  log?: string[];
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
    let msg = `${blue('build:')} ${event.build_id} ${blue('job:')} ${event.job_id} - ` +
      yellow(event.data);
    logger.info(msg);
  });

// main scheduler
const concurrency = config.concurrency || 10;
jobProcesses
  .mergeMap((jobProcesses: JobProcess[]) => {
    return Observable.from(
      jobProcesses
        .filter(process => process.status === 'queued')
        .map(process => Observable.fromPromise(startJob(process.build_id, process.job_id)))
      );
  })
  .mergeAll(concurrency)
  .subscribe();

// inserts new build into db and queue related jobs.
// returns inserted build id
export function startBuild(data: any): Promise<any> {
  return getRepositoryOnly(data.repositories_id)
    .then(repository => {
      let sha = null;
      if (data) {
        if (data.sha) {
          sha = data.sha;
        }  else if (data.data.checkout_sha) {
          sha = data.data.checkout_sha;
        } else if (data.data.object_attributes && data.data.object_attributes.last_commit) {
            sha = data.data.object_attributes.last_commit.id;
        }
      }

      const pr = data && data.pr ? data.pr : null;
      let repoDetails = null;

      return getRepositoryDetails(repository, sha, pr)
        .then(details => {
          repoDetails = details;

          if (pr) {
            repoDetails.config.git.pr = data.pr;
          } else if (!sha) {
            repoDetails.config.git.sha = repoDetails.log.commit_hash;
          }
        })
        .then(() => {
          if (!sha && repository.github_id) {
            const url = 'https://api.github.com/repos/' +
              repository.full_name + '/commits/' + repoDetails.log.commit_hash;

            return getHttpJsonResponse(url);
          } else if (!sha && repository.bitbucket_id) {
            let url;
            if (data.data.pullrequest) {
              url = data.data.pullrequest.destination.commit.links.self.href;
            } else if (data.data.push) {
              url = data.data.push.changes[0].new.target.links.self.href;
            }
            if (url) {
              if (repository.private) {
                if (repository.access_token) {
                  return getBitBucketAccessToken(repository.access_token)
                    .then(response => {
                      let access_token = JSON.parse(response).access_token;
                      url = url + `?access_token=${access_token}`;

                      return getHttpJsonResponse(url);
                    })
                    .catch(err => Promise.reject(err));
                }

                return Promise.reject({ error: 'Repository access token is not provided.' });
              }

              return getHttpJsonResponse(url);
            }
            return Promise.resolve(null);
          } else {
            return Promise.resolve(null);
          }
        })
        .then(commit => {
          if (commit) {
            if (commit.hash) {
              data.data.sha = commit.hash;
            }
            if (commit.message) {
              data.data.message = commit.message;
            }
            sha = sha || repoDetails.log.commit_hash || commit.hash;
          }

          return insertBuild(data)
            .then(build => {
              data.build_id = build.id;
              delete data.repositories_id;
              delete data.pr;
              insertBuildRun(data)
                .then(() => {
                  if (repository.access_token) {
                    if (repository.github_id) {
                      const name = data.data.repository.full_name;
                      const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
                      const abstruseUrl = `${config.url}/build/${build.id}`;

                      return setGitHubStatusPending(gitUrl, abstruseUrl, repository.access_token);
                    } else if (repository.bitbucket_id) {
                      const name = data.data.repository.full_name;
                      const gitUrl = `https://api.bitbucket.org/2.0/repositories`
                        + `/${name}/commit/${sha}/statuses/build`;
                      const abstruseUrl = `${config.url}/build/${build.id}`;

                      return setBitbucketStatusPending(gitUrl, abstruseUrl,
                        repository.access_token);
                    } else if (repository.gitlab_id) {
                      const id = data.data.project_id ?
                        data.data.project_id : data.data.object_attributes.target_project_id;
                      const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
                      const abstruseUrl = `${config.url}/build/${build.id}`;

                      return setGitLabStatusPending(gitUrl, abstruseUrl, repository.access_token);
                    } else {
                      return Promise.resolve();
                    }
                  } else {
                    return Promise.resolve();
                  }
                })
                .then(() => {
                  const jobsCommands = generateCommands(repository.clone_url, repoDetails.config);

                  return jobsCommands.reduce((prev, commands, i) => {
                    return prev.then(() => {
                      const lang = repoDetails.config.language;
                      const langVersion = repoDetails.config.matrix[i].node_js; // TODO: update
                      const testScript = repoDetails.config.matrix[i].env;

                      const jobData = {
                        commands: JSON.stringify(commands),
                        language: lang,
                        language_version: langVersion,
                        test_script: testScript,
                        builds_id: build.id
                      };

                      return dbJob.insertJob(jobData)
                        .then(job => {
                          getLastRunId(build.id).then(buildRunId => {
                            const jobRunData = {
                              start_time: new Date(),
                              end_time: null,
                              status: 'queued',
                              log: '',
                              build_run_id: buildRunId,
                              job_id: job.id
                            };

                            return dbJobRuns.insertJobRun(jobRunData).then(() => {
                              jobEvents.next({
                                type: 'process',
                                build_id: build.id,
                                job_id: job.id,
                                data: 'jobAdded'
                              });

                              return queueJob(build.id, job.id);
                            });
                          });
                        }).catch(err => logger.error(err));
                    });
                  }, Promise.resolve());
            })
            .then(() => {
              jobEvents.next({
                type: 'process',
                build_id: build.id,
                repository_id: data.repositories_id,
                data: 'buildAdded'
              });
            }).catch(err => logger.error(err));
        });
      });
  }).catch(err => logger.error(err));
}

export function startJob(buildId: number, jobId: number): Promise<void> {
  return getJobProcesses()
    .then(procs => {
      const procIndex = procs.findIndex(job => job.job_id === jobId && job.build_id === buildId);
      procs[procIndex].status = 'running';
      jobProcesses.next(procs);
      const process = procs[procIndex];

      process.job
        .subscribe(event => {
          terminalEvents.next(event);
          if (event.data && event.type === 'data') {
            process.log.push(event.data);
            procs[procIndex] = process;
            jobProcesses.next(procs);
          }
        });

      return dbJob.getLastRunId(jobId)
        .then(runId => {
          const jobRunData = { id: runId, start_time: new Date(), status: 'running', log: '' };
          return dbJobRuns.updateJobRun(jobRunData)
            .then(() => {
              jobEvents.next({
                type: 'process',
                build_id: buildId,
                job_id: jobId,
                data: 'jobStarted'
              });
            });
          }).catch(err => logger.error(err));
    }).catch(err => logger.error(err));
}

export function stopJob(jobId: number): Promise<void> {
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
        .then(job => killContainer(`abstruse_${job.build_id}_${job.job_id}`))
        .catch(err => logger.error(err));
    } else {
      return Promise.resolve()
        .then(() => killContainer(`abstruse_${job.build_id}_${job.job_id}`))
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
    .then(job => commands = JSON.parse(job.commands))
    .then(() => {
      const jobProcess: JobProcess = {
        build_id: buildId,
        job_id: jobId,
        status: 'queued',
        job: prepareJob(buildId, jobId, commands, sshAndVnc),
        log: []
      };

      processes.push(jobProcess);
      jobProcesses.next(processes);
      jobEvents.next({ type: 'process', build_id: buildId, job_id: jobId, data: 'jobQueued' });
    }).catch(err => logger.error(err));
}

function prepareJob(buildId: number, jobId: number, cmds: any, sshAndVnc = false):
  Observable<JobMessage> {
  return new Observable(observer => {
    getJobProcesses().then(processes => {
      const index = processes.findIndex(job => job.job_id === jobId && job.build_id === buildId);
      processes[index].status = 'completed';
      jobProcesses.next(processes);
      const process = processes[index];

      startBuildProcess(buildId, jobId, cmds, 'abstruse', sshAndVnc).subscribe(event => {
        const msg: JobMessage = {
          build_id: buildId,
          job_id: jobId,
          type: event.type,
          data: event.data
        };

        observer.next(msg);
      }, err => {
        logger.error(err);
        observer.complete();

        dbJob.getLastRunId(jobId)
          .then(runId => {
            const data = {
              id: runId,
              end_time: new Date(),
              status: 'failed',
              log: process.log.join('')
            };

            return dbJobRuns.updateJobRun(data);
          })
          .then(() => {
            processes = processes.filter(proc => proc.job_id !== jobId);
            jobProcesses.next(processes);
            jobEvents.next({
              type: 'process',
              build_id: buildId,
              job_id: jobId,
              data: 'jobFailed'
            });
          })
          .then(() => getBuild(buildId))
          .then(build => {
            if (build.repository.access_token) {
              if (build.repository.github_id) {
                const sha = build.data.after || build.data.pull_request.head.sha;
                const name = build.data.repository.full_name;
                const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
                const abstruseUrl = `${config.url}/build/${buildId}`;

                return setGitHubStatusFailure(gitUrl, abstruseUrl, build.repository.access_token);
              } else if (build.repository.bitbucket_id) {
                const sha = build.data.sha;
                const name = build.data.repository.full_name;
                const gitUrl = `https://api.bitbucket.org/2.0/repositories`
                  + `/${name}/commit/${sha}/statuses/build`;
                const abstruseUrl = `${config.url}/build/${buildId}`;

                return setBitbucketStatusFailure(gitUrl, abstruseUrl,
                  build.repository.access_token);
              } else if (build.repository.gitlab_id) {
                const id = build.data.project_id ?
                  build.data.project_id : build.data.object_attributes.target_project_id;
                const sha = build.data.checkout_sha || build.data.object_attributes.last_commit.id;
                const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
                const abstruseUrl = `${config.url}/build/${buildId}`;
                return setGitLabStatusFailure(gitUrl, abstruseUrl, build.repository.access_token);
              } else {
                return Promise.resolve();
              }
            } else {
              return Promise.resolve();
            }
          }).catch(err => logger.error(err));
      }, () => {
        observer.complete();

        dbJob.getLastRunId(jobId)
          .then(runId => {
            const data = {
              id: runId,
              end_time: new Date(),
              status: 'success',
              log: process.log.join('')
            };

            return dbJobRuns.updateJobRun(data);
          })
          .then(() => getBuildStatus(buildId))
          .then(status => {
            if (status) {
              return updateBuild({ id: buildId, end_time: new Date() })
                .then(() => getLastRunId(buildId))
                .then(id => updateBuildRun({ id: id, end_time: new Date()} ))
                .then(() => getBuild(buildId))
                .then(build => {
                  if (build.repository.access_token) {
                    if (build.repository.github_id) {
                      const sha = build.data.after || build.data.pull_request.head.sha;
                      const name = build.data.repository.full_name;
                      const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
                      const abstruseUrl = `${config.url}/build/${buildId}`;

                      return setGitHubStatusSuccess(gitUrl, abstruseUrl,
                        build.repository.access_token);
                    } else if (build.repository.bitbucket_id) {
                      const sha = build.data.sha;
                      const name = build.data.repository.full_name;
                      const gitUrl = `https://api.bitbucket.org/2.0/repositories`
                        + `/${name}/commit/${sha}/statuses/build`;
                      const abstruseUrl = `${config.url}/build/${buildId}`;

                      return setBitbucketStatusSuccess(gitUrl, abstruseUrl,
                        build.repository.access_token);
                    } else if (build.repository.gitlab_id) {
                      const id = build.data.project_id ?
                        build.data.project_id : build.data.object_attributes.target_project_id;
                      const sha = build.data.checkout_sha
                        || build.data.object_attributes.last_commit.id;
                      const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
                      const abstruseUrl = `${config.url}/build/${buildId}`;

                      return setGitLabStatusSuccess(gitUrl, abstruseUrl,
                        build.repository.access_token);
                    } else {
                      return Promise.resolve();
                    }
                  } else {
                    return Promise.resolve();
                  }
                })
                .catch(err => logger.error(err));
            } else {
              return Promise.resolve();
            }
          })
          .then(() => {
            processes = processes.filter(proc => proc.job_id !== jobId);
            jobProcesses.next(processes);
            jobEvents.next({
              type: 'process',
              build_id: buildId,
              job_id: jobId,
              data: 'jobSucceded'
            });
          }).catch(err => logger.error(err));
      });
    }).catch(err => logger.error(err));
  });
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
        .then(() => {
          if (accessToken) {
            if (buildData.repository.github_id) {
              const sha = buildData.data.after;
              const name = buildData.data.repository.full_name;
              const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
              const abstruseUrl = `${config.url}/build/${buildData.id}`;

              return setGitHubStatusPending(gitUrl, abstruseUrl, buildData.repository.access_token);
            } else if (buildData.repository.bitbucket_id) {
              const sha = buildData.data.sha;
              const name = buildData.data.repository.full_name;
              const gitUrl = `https://api.bitbucket.org/2.0/repositories`
                + `/${name}/commit/${sha}/statuses/build`;
              const abstruseUrl = `${config.url}/build/${buildData.id}`;

              return setBitbucketStatusPending(gitUrl, abstruseUrl,
                buildData.repository.access_token);
            } else if (buildData.repository.gitlab_id) {
              const id = buildData.data.project_id ?
              buildData.data.project_id : buildData.data.object_attributes.target_project_id;
              const sha = buildData.data.checkout_sha
                || buildData.data.object_attributes.last_commit.id;
              const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
              const abstruseUrl = `${config.url}/build/${buildId}`;

              return setGitLabStatusPending(gitUrl, abstruseUrl, buildData.repository.access_token);
            } else {
              return Promise.resolve();
            }
          } else {
            return Promise.resolve();
          }
        }).catch(err => logger.error(err));
    }).catch(err => logger.error(err));
}

export function stopBuild(buildId: number): Promise<any> {
  return getJobProcesses()
    .then(procs => {
        return procs.filter(job => job.build_id === buildId).reduce((prev, current) => {
          return prev.then(() => stopJob(current.job_id));
        }, Promise.resolve());
    })
    .then(() => getBuild(buildId))
    .then(buildData => {
      if (buildData.repository.access_token && buildData.repository.github_id) {
        if (buildData.repository.github_id) {
          const sha = buildData.data.after;
          const name = buildData.data.repository.full_name;
          const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
          const abstruseUrl = `${config.url}/build/${buildId}`;

          return setGitHubStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
        } else if (buildData.repository.bitbucket_id) {
          const sha = buildData.data.sha;
          const name = buildData.data.repository.full_name;
          const gitUrl = `https://api.bitbucket.org/2.0/repositories`
            + `/${name}/commit/${sha}/statuses/build`;
          const abstruseUrl = `${config.url}/build/${buildId}`;

          return setBitbucketStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
        } else if (buildData.repository.gitlab_id) {
          const id = buildData.data.project_id ?
          buildData.data.project_id : buildData.data.object_attributes.target_project_id;
          const sha = buildData.data.checkout_sha
            || buildData.data.object_attributes.last_commit.id;
          const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
          const abstruseUrl = `${config.url}/build/${buildId}`;

          return setGitLabStatusFailure(gitUrl, abstruseUrl, buildData.repository.access_token);
        } else {
          return Promise.resolve();
        }
      }
    }).catch(err => logger.error(err));
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
    .then(build => {
      if (build.repository.access_token) {
        if (build.repository.github_id) {
          const sha = build.data.data.after;
          const name = build.data.repository.full_name;
          const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
          const abstruseUrl = `${config.url}/build/${build.id}`;

          return setGitHubStatusPending(gitUrl, abstruseUrl, build.repository.access_token);
        } else if (build.repository.bitbucket_id) {
          const sha = build.data.sha;
          const name = build.data.repository.full_name;
          const gitUrl = `https://api.bitbucket.org/2.0/repositories`
            + `/${name}/commit/${sha}/statuses/build`;
          const abstruseUrl = `${config.url}/build/${build.id}`;

          return setBitbucketStatusPending(gitUrl, abstruseUrl, build.repository.access_token);
        } else if (build.repository.gitlab_id) {
          const id = build.data.project_id ?
          build.data.project_id : build.data.object_attributes.target_project_id;
          const sha = build.data.checkout_sha
            || build.data.object_attributes.last_commit.id;
          const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
          const abstruseUrl = `${config.url}/build/${build.id}`;

          return setGitLabStatusPending(gitUrl, abstruseUrl, build.repository.access_token);
        } else {
          return Promise.resolve();
        }
      } else {
        return Promise.resolve();
      }
    }).catch(err => logger.error(err));
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
    .then(build => {
      if (build.repository.access_token) {
        if (build.repository.github_id) {
          const sha = build.data.data.after;
          const name = build.data.repository.full_name;
          const gitUrl = `https://api.github.com/repos/${name}/statuses/${sha}`;
          const abstruseUrl = `${config.url}/build/${build.id}`;

          return setGitHubStatusPending(gitUrl, abstruseUrl, build.repository.access_token);
        } else if (build.repository.bitbucket_id) {
          const sha = build.data.sha;
          const name = build.data.repository.full_name;
          const gitUrl = `https://api.bitbucket.org/2.0/repositories`
            + `/${name}/commit/${sha}/statuses/build`;
          const abstruseUrl = `${config.url}/build/${build.id}`;

          return setBitbucketStatusPending(gitUrl, abstruseUrl, build.repository.access_token);
        } else if (build.repository.gitlab_id) {
          const id = build.data.project_id ?
          build.data.project_id : build.data.object_attributes.target_project_id;
          const sha = build.data.checkout_sha
            || build.data.object_attributes.last_commit.id;
          const gitUrl = `https://gitlab.com/api/v4/projects/${id}/statuses/${sha}`;
          const abstruseUrl = `${config.url}/build/${build.id}`;

          return setGitLabStatusPending(gitUrl, abstruseUrl, build.repository.access_token);
        } else {
          return Promise.resolve();
        }
      } else {
        return Promise.resolve();
      }
    }).catch(err => logger.error(err));
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
