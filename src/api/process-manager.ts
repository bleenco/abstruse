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
import { getConfig, getHttpJsonResponse } from './utils';
import { setGitHubStatusError, setGitHubStatusFailure,
  setGitHubStatusPending, setGitHubStatusSuccess } from './github-commit-status';

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
      const sha = data && data.sha ? data.sha : null;
      const pr = data && data.pr ? data.pr : null;
      let repoDetails = null;

      return getRepositoryDetails(repository.clone_url, sha, pr)
        .then(details => {
          repoDetails = details;

          if (pr) {
            repoDetails.config.git.pr = data.pr;
          } else if (!sha) {
            repoDetails.config.git.sha = repoDetails.log.commit_hash;
            data.sha = repoDetails.log.commit_hash;
            data.head_sha = repoDetails.log.commit_hash;
            data.label = repository.full_name;
            data.head_label = repository.full_name;
            data.ref = repository.default_branch;
            data.head_ref = repository.default_branch;
            data.author = repoDetails.log.commit_author;
            data.user = repoDetails.log.commit_author.split('<')[0];
            data.message = repoDetails.log.commit_message;
            data.start_time = repoDetails.log.commit_date;
          }
        })
        .then(() => {
          if (!sha) {
            const url = 'https://api.github.com/repos/' +
              repository.full_name + '/commits/' + repoDetails.log.commit_hash;
            return getHttpJsonResponse(url);
          } else {
            return Promise.resolve(null);
          }
        })
        .then(commit => {
          if (commit) {
            data = Object.assign(data, {
              user: commit.author.login,
              author: commit.commit.author.name,
              head_github_id: repository.github_id,
              head_clone_url: repository.clone_url,
              head_html_url: repository.html_url,
              head_default_branch: repository.default_branch,
              head_name: repository.name,
              head_full_name: repository.full_name,
              head_description: repository.description,
              head_private: repository.private,
              head_fork: repository.fork,
              head_user_login: commit.author.login,
              head_user_id: commit.author.id,
              head_user_avatar_url: commit.author.avatar_url,
              head_user_url: commit.author.url,
              head_user_html_url: commit.author.html_url
            });
          }

          return insertBuild(data)
            .then(build => {
              data.build_id = build.id;
              delete data.repositories_id;
              delete data.pr;
              insertBuildRun(data)
                .then(() => {
                  let gitUrl =
                    `https://api.github.com/repos/${data.head_full_name}/statuses/${data.sha}`;
                  let abstruseUrl = `${config.url}/build/${build.id}`;
                  return setGitHubStatusPending(gitUrl, abstruseUrl, repository.token);
                });
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
                    });
                });
              }, Promise.resolve());
            });
        });
    });
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
        });
    });
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
        .then(job => killContainer(`abstruse_${job.build_id}_${job.job_id}`));
    } else {
      return Promise.resolve()
        .then(() => killContainer(`abstruse_${job.build_id}_${job.job_id}`))
        .then(() => dbJob.getLastRunId(jobId))
        .then(runId => dbJobRuns.getRun(runId))
        .then(jobRun => {
          if (jobRun.status !== 'success') {
            return dbJobRuns.updateJobRun({id: jobRun.id, end_time: new Date(), status: 'failed'});
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
        });
    }
  });
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
    });
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
        observer.complete();

        dbJob.getLastRunId(jobId)
        .then(runId => dbJobRuns.updateJobRun(
          {id: runId, end_time: new Date(), status: 'failed', log: process.log.join('')}))
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
          let gitUrl =
            `https://api.github.com/repos/${build.head_full_name}/statuses/${build.sha}`;
          let abstruseUrl = `${config.url}/build/${buildId}`;
          return setGitHubStatusFailure(gitUrl, abstruseUrl, build.repository.token);
        });
      }, () => {
        dbJob.getLastRunId(jobId)
        .then(runId => dbJobRuns.updateJobRun(
          {id: runId, end_time: new Date(), status: 'success', log: process.log.join('')}))
        .then(() => getBuildStatus(buildId))
        .then(status => {
          if (status) {
            updateBuild({ id: buildId, end_time: new Date()});
            getLastRunId(buildId)
              .then(id => {
                updateBuildRun({ id: id, end_time: new Date()});
              })
              .then(() => getBuild(buildId))
              .then(build => {
                let gitUrl =
                  `https://api.github.com/repos/${build.head_full_name}/statuses/${build.sha}`;
                let abstruseUrl = `${config.url}/build/${buildId}`;
                return setGitHubStatusSuccess(gitUrl, abstruseUrl, build.repository.token);
              });
          }
          Promise.resolve();
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
        });

        observer.complete();
      });
    });
  });
}

export function restartBuild(buildId: number): Promise<any> {
  return stopBuild(buildId)
    .then(() => getBuild(buildId))
    .then(build => {
      let jobs = build.jobs;
      build.start_time = new Date();
      build.end_time = null;

      return updateBuild(build)
        .then(() => {
          build.build_id = buildId;
          delete build.repositories_id;
          delete build.jobs;
          delete build.pr;
          insertBuildRun(build);
        })
        .then(() => getLastRunId(build.id))
        .then(buildRunId => {
          return jobs.forEach(job => {
            dbJobRuns.insertJobRun({
              start_time: new Date(),
              end_time: null,
              status: 'queued',
              log: '',
              build_run_id: buildRunId,
              job_id: job.id
            });
          });
        })
        .then(() => {
          return jobs.reduce((prev, curr) => {
            return prev.then(() => queueJob(buildId, curr.id));
          }, Promise.resolve());
        })
        .then(() => {
          let gitUrl =
            `https://api.github.com/repos/${build.head_full_name}/statuses/${build.sha}`;
          let abstruseUrl = `${config.url}/build/${build.id}`;
          return setGitHubStatusPending(gitUrl, abstruseUrl, build.repository.token);
        });
    });
}

export function stopBuild(buildId: number): Promise<any> {
  return getJobProcesses()
    .then(procs => {
        return procs.filter(job => job.build_id === buildId).reduce((prev, current) => {
          return prev.then(() => stopJob(current.job_id));
        }, Promise.resolve());
    });
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
    .then(job => jobData = job)
    .then(() => queueJob(jobData.builds_id, jobId))
    .then(() => {
      jobEvents.next({
        type: 'process',
        build_id: jobData.builds_id,
        job_id: jobData.id,
        data: 'jobRestarted'
      });
    });
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
    .then(job => jobData = job)
    .then(() => queueJob(jobData.builds_id, jobId, true))
    .then(() => {
      jobEvents.next({
        type: 'process',
        build_id: jobData.builds_id,
        job_id: jobData.id,
        data: 'jobRestarted'
      });
    });
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
      console.error(err);
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
