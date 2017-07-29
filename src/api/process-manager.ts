import { prepareBuildJob, Job, startDockerImageSetupJob } from './process';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { insertBuild, updateBuild, getBuild } from './db/build';
import * as dbJob from './db/job';
import { getRepositoryOnly } from './db/repository';
import { getRepositoryDetails, generateCommands } from './config';
import { killContainer } from './docker';
import * as logger from './logger';
import { blue, yellow, green, cyan } from 'chalk';
import { getConfig, getHttpJsonResponse } from './utils';

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
  .mergeMap(jobProcesses => {
    const running = jobProcesses.filter(proc => proc.status === 'running');
    const len = running.length;
    if (len < concurrency) {
      return Observable.from(
        jobProcesses
          .filter(job => job.status === 'queued')
          .filter((job, i) => i < concurrency - len)
          .map(job => Observable.fromPromise(startJob(job.build_id, job.job_id)))
      );
    } else {
      return Observable.empty();
    }
  })
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
              let jobsCommands = generateCommands(repository.clone_url, repoDetails.config);

              return Promise.all(jobsCommands.map((commands, i) => {
                const lang = repoDetails.config.language;
                const langVersion = repoDetails.config.matrix[i].node_js; // TODO: update
                const testScript = repoDetails.config.matrix[i].env;

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

export function restartBuild(buildId: number): Promise<any> {
  return stopBuild(buildId)
    .then(() => getBuild(buildId))
    .then(build => {
      build.start_time = new Date();
      build.end_time = null;

      return updateBuild(build)
        .then(() => dbJob.resetJobs(buildId))
        .then(jobs => {
          return jobs.reduce((prev, curr) => {
            return prev.then(() => queueJob(buildId, curr.id));
          }, Promise.resolve());
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

function queueJob(buildId: number, jobId: number): Promise<void> {
  let commands;
  return dbJob.updateJob({ id: jobId, start_time: new Date(), status: 'queued' })
    .then(jobData => {
      commands = jobData.commands;
      return getJobProcesses();
    })
    .then(procs => {
      const jobProcess: JobProcess = {
        build_id: buildId,
        job_id: jobId,
        status: 'queued',
        job: prepareJob(buildId, jobId, JSON.parse(commands)),
        log: []
      };

      procs.push(jobProcess);
      jobProcesses.next(procs);
      jobEvents.next({ type: 'process', build_id: buildId, job_id: jobId, data: 'jobQueued' });
    });
}

export function startJob(buildId: number, jobId: number): Promise<void> {
  return new Promise(resolve => {
    getJobProcesses()
      .then(procs => {
        const procIndex = procs.findIndex(job => job.job_id === jobId && job.build_id === buildId);
        procs[procIndex].status = 'running';
        jobProcesses.next(procs);
        const process = procs[procIndex];

        process.job
          .skip(1)
          .subscribe(event => {
            terminalEvents.next(event);
            if (event.data) {
              process.log.push(event.data);
              procs[procIndex] = process;
              jobProcesses.next(procs);
            }
          });

        return dbJob.updateJob({ id: jobId, start_time: new Date(), status: 'running', log: '' })
          .then(jobData => {
            jobEvents.next({
              type: 'process',
              build_id: buildId,
              job_id: jobId,
              data: 'jobStarted'
            });

            resolve();
          });
      });
  });
}

export function restartJob(jobId: number): Promise<void> {
  return getJobProcesses()
    .then(procs => {
      const jobProcess = procs.find(job => job.job_id === jobId);
      if (jobProcess) {
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
        return dbJob.getJob(jobId).then(job => queueJob(job.builds_id, job.id));
      }
    });
}

export function stopJob(jobId: number): Promise<any> {
  return new Promise(resolve => {
    getJobProcesses()
      .then(procs => {
        const jobProcess = procs.find(job => job.job_id === jobId);
        if (jobProcess) {
          procs = procs.filter(job => job.job_id !== jobId);
          jobProcesses.next(procs);

          jobEvents.next({
            type: 'process',
            build_id: jobProcess.build_id,
            job_id: jobProcess.job_id,
            data: 'jobStopped'
          });

          const log = jobProcess.log.join('');
          dbJob.updateJob({ id: jobId, end_time: new Date(), status: 'failed', log: log })
            .then(() => killContainer(`${jobProcess.build_id}_${jobProcess.job_id}`).toPromise())
            .then(() => resolve(jobProcess));
        } else {
          dbJob.updateJob({ id: jobId, end_time: new Date(), status: 'failed' })
            .then(jobProcess => resolve(jobProcess));
        }
      });
  });
}

function prepareJob(buildId: number, jobId: number, cmds: any): Observable<JobMessage> {
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
        getJobProcesses()
          .then(procs => {
            const index = procs.findIndex(job => job.job_id === jobId && job.build_id === buildId);
            procs[index].status = 'completed';
            jobProcesses.next(procs);
            const proc = procs[index];

            return dbJob.updateJob({
              id: jobId,
              end_time: new Date(),
              status: output.data === 0 ? 'success' : 'failed',
              log: proc.log.join('')
            }).then(() => {
              jobEvents.next({
                type: 'process',
                build_id: buildId,
                job_id: jobId,
                data: output.data === 0 ? 'jobSucceded' : 'jobFailed'
              });

              procs = procs.filter(job => job.job_id !== jobId && job.build_id !== buildId);
              jobProcesses.next(procs);

              observer.complete();
            });
          });
      }
    });
  });
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
