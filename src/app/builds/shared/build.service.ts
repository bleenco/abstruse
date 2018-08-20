import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../shared/providers/data.service';
import { TimeService } from '../../shared/providers/time.service';
import { BuildStatus, Build, BuildJob } from './build.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { JSONResponse } from '../../core/shared/shared.model';
import { Subscription } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { distanceInWordsToNow } from 'date-fns';

export interface ProviderData {
  nameAuthor?: string;
  nameCommitter?: string;
  commitMessage?: string;
  committerAvatar?: string;
  authorAvatar?: string;
  dateTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BuildService {
  currentTime: number;
  build: Build;
  builds: Build[] = [];
  loading: boolean;
  fetchingBuild: boolean;
  fetchingBuilds: boolean;
  hideMoreButton: boolean;
  show: 'all' | 'pr' | 'commits';
  limit: number;
  offset: number;
  userId: number;
  maxCompletedJobTime: number;
  minRunningJobStartTime: number;
  previousRuntime: number;
  dateTime: string;
  dateTimeToNow: string;
  timeWords: string;
  statusSub: Subscription;
  buildSub: Subscription;
  sub: Subscription;
  timerSubscription: Subscription;
  buildsSubAdded: Subscription;
  buildsSub: Subscription;
  buildsSubUpdate: Subscription;
  fetchingJob: boolean;
  job: any;
  jobRun: any;
  termSub: Subscription;
  jobSub: Subscription;
  terminalInput: any;
  debug: boolean;
  sshd: string;
  vnc: string;

  constructor(
    public http: HttpClient,
    public dataService: DataService,
    public timeService: TimeService,
    private titleService: Title,
    @Inject(DOCUMENT) private document: any,
  ) {
    this.resetFields();
  }

  fetchBuilds(): void {
    if (this.loading) {
      this.subscribeToBuilds();
    }

    this.fetchingBuilds = true;

    const url = getAPIURL() + `/builds`;
    let params = new HttpParams();
    params = params.append('limit', String(this.limit));
    params = params.append('offset', String(this.offset));
    params = params.append('filter', this.show);

    this.http.get<JSONResponse>(url, { params })
      .pipe(
        catchError(handleError<JSONResponse>('builds'))
      )
      .subscribe(resp => {
        if (resp && resp.data && resp.data.length) {
          Promise.resolve()
            .then(() => Promise.all<Build>(resp.data.map(build => this.generateBuild(build))))
            .then((builds: Build[]) => {
              this.builds = this.builds.concat(builds.sort((a, b) => b.id - a.id));
              this.fetchingBuilds = false;
              this.loading = false;
              if (builds.length === this.limit) {
                this.offset += 5;
                this.hideMoreButton = false;
              } else {
                this.hideMoreButton = true;
              }
              this.updateBuilds();
            });
        }
      });
  }

  fetchBuild(buildId: number): void {
    this.fetchingBuild = true;

    const url = getAPIURL() + `/builds/${buildId}`;
    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>(`builds/${buildId}`))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          Promise.resolve()
            .then(() => this.generateBuild(resp.data))
            .then((build: Build) => {
              const jobs = resp.data.jobs.map(job => this.generateJob(job, resp.data.id));
              build.setJobs(jobs);
              return build;
            })
            .then((build: Build) => {
              this.build = build;
              this.fetchingBuild = false;
              this.build.status = this.getBuildStatus();
              this.updateJobTimes();
              this.subscribeToBuildDetails();
            });
        }
      });
  }

  fetchJob(buildId: number, jobId: number, showLoader: boolean = true): void {
    if (showLoader) {
      this.unsubscribeFromJobDetails();
      this.fetchingJob = true;
    }

    const url = getAPIURL() + `/builds/${buildId}/${jobId}`;
    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>(`builds/${buildId}/${jobId}`))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          Promise.resolve()
            .then(() => this.generateBuild(resp.data.build))
            .then((build: Build) => this.build = build)
            .then(() => this.generateJob(resp.data, resp.data.build.id))
            .then(job => {
              this.job = job;
              this.jobRun = resp.data.runs[resp.data.runs.length - 1];

              this.terminalInput = this.jobRun.log;
              this.timeWords = distanceInWordsToNow(resp.data.build.created_at);
              this.loading = false;
              const lastRun = job.runs && job.runs[job.runs.length - 1].end_time ?
                job.runs[job.runs.length - 1] : job.runs[job.runs.length - 2];
              if (lastRun) {
                this.previousRuntime = lastRun.end_time - lastRun.start_time;
              }

              if (showLoader) {
                this.fetchingJob = false;
                this.subscribeToJobDetails(jobId);
              }
            });
        }
      });
  }

  restartJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.terminalInput = { clear: true };

    const index = this.build.jobs.findIndex(job => job.id === jobId);
    if (index !== -1) {
      this.build.jobs[index].processing = true;
    } else {
      this.job.processing = true;
    }
    this.dataService.socketInput.emit({ type: 'restartJob', data: { jobId: jobId } });
  }

  stopJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    const index = this.build.jobs.findIndex(job => job.id === jobId);
    if (index !== -1) {
      this.build.jobs[index].processing = true;
    } else {
      this.job.processing = true;
    }
    this.dataService.socketInput.emit({ type: 'stopJob', data: { jobId: jobId } });
  }

  restartBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.build) {
      this.previousRuntime = 0;
      const maxJobTime = Math.max(...this.build.jobs.map(job => job.end_time - job.start_time));
      this.previousRuntime = maxJobTime ? maxJobTime : 0;
      this.build.processing = true;
    } else {
      this.previousRuntime = 0;
      const build = this.builds.find(b => b.id === id);
      const maxJobTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
      this.previousRuntime = maxJobTime ? maxJobTime : 0;
      build.processing = true;
    }

    this.dataService.socketInput.emit({ type: 'restartBuild', data: { buildId: id } });
  }

  stopBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.build) {
      this.build.processing = true;
    } else {
      const build = this.builds.find(b => b.id === id);
      build.processing = true;
    }

    this.dataService.socketInput.emit({ type: 'stopBuild', data: { buildId: id } });
  }

  subscribeToBuilds(): void {
    this.unsubscribeFromBuilds();

    this.buildsSubAdded = this.dataService.socketOutput
      .pipe(filter(x => x.type !== 'data'))
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.data === 'build added' && event.additionalData) {
          if (!this.builds) {
            this.builds = [];
          }

          Promise.resolve()
            .then(() => this.generateBuild(event.additionalData))
            .then((build: Build) => this.builds.unshift(build))
            .then(() => this.updateBuilds());
        }
      });

    this.buildsSub = this.dataService.socketOutput
      .pipe(
        filter(x => {
          x = x.data ? x.data.toString() : '';
          return x.startsWith('job');
        })
      )
      .subscribe(e => {
        const build = this.builds.findIndex(b => b.id === e.build_id);
        if (build === -1) {
          return;
        }

        const index = this.builds[build].jobs.findIndex(job => job.id === e.job_id);
        if (index !== -1) {
          switch (e.data) {
            case 'job succeded':
              this.builds[build].jobs[index].status = BuildStatus.passed;
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
            case 'job queued':
              this.builds[build].jobs[index].status = BuildStatus.queued;
              break;
            case 'job started':
              this.builds[build].jobs[index].status = BuildStatus.running;
              this.builds[build].jobs[index].start_time = e.additionalData;
              this.builds[build].jobs[index].end_time = null;
              break;
            case 'job failed':
              this.builds[build].jobs[index].status = BuildStatus.failed;
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
            case 'job stopped':
              this.builds[build].jobs[index].status = BuildStatus.failed;
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
          }

          this.updateBuilds();
        }
      });

    this.buildsSubUpdate = this.dataService.socketOutput
      .pipe(
        filter(event => event.data === 'build restarted' || event.data === 'build succeeded' || event.data === 'build failed')
      )
      .subscribe(event => {
        const index = this.builds.findIndex(i => i.id === event.build_id);
        if (index !== -1) {
          if (event.data === 'build restarted') {
            this.builds[index].start_time = event.additionalData;
          } else {
            this.builds[index].end_time = event.additionalData;
            this.updateBuilds();
          }
        }
      });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  unsubscribeFromBuilds(): void {
    if (this.buildsSub) {
      this.buildsSub.unsubscribe();
    }

    if (this.buildsSubAdded) {
      this.buildsSubAdded.unsubscribe();
    }

    if (this.buildsSubUpdate) {
      this.buildsSubUpdate.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  subscribeToBuildDetails(): void {
    this.unsubscribeFromBuildDetails();

    this.statusSub = this.dataService.socketOutput
      .pipe(filter(event => event.type === 'process' && this.build.jobs.findIndex(job => job.id === event.job_id) !== -1))
      .subscribe(event => {
        const job = this.build.jobs.find(j => j.id === event.job_id);
        switch (event.data) {
          case 'job started':
            job.status = BuildStatus.running;
            job.end_time = null;
            job.start_time = event.additionalData;
            job.runs.push({ start_time: event.additionalData, end_time: null });
            break;
          case 'job succeded':
            job.status = BuildStatus.passed;
            job.end_time = event.additionalData;
            job.runs[job.runs.length - 1].end_time = event.additionalData;
            break;
          case 'job failed':
            job.status = BuildStatus.failed;
            if (job.end_time) {
              job.end_time = event.additionalData;
            }
            if (job.runs[job.runs.length - 1].end_time) {
              job.runs[job.runs.length - 1].end_time = event.additionalData;
            }
            break;
          case 'job stopped':
            if (job.status !== BuildStatus.passed) {
              job.status = BuildStatus.failed;
            }
            if (job.end_time) {
              job.end_time = event.additionalData;
            }
            if (job.runs[job.runs.length - 1].end_time) {
              job.runs[job.runs.length - 1].end_time = event.additionalData;
            }
            break;
          case 'job queued':
            job.status = BuildStatus.queued;
            break;
        }

        job.processing = false;
        this.build.status = this.getBuildStatus();
        this.updateJobTimes();
      });

    this.sub = this.dataService.socketOutput
      .pipe(filter(e => e.type === 'build stopped' || e.type === 'build restarted'))
      .subscribe(() => this.build.processing = false);

    this.buildSub = this.dataService.socketOutput
      .pipe(filter(e => e.data === 'build restarted' || e.data === 'build succeded' || e.data === 'build failed'))
      .subscribe(e => {
        if (e.build_id === Number(this.build.id)) {
          if (e.data === 'build restarted') {
            this.build.start_time = e.additionalData;
            this.build.processing = false;
          } else {
            this.build.end_time = e.additionalData;
          }
        }
      });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.dateTimeToNow = distanceInWordsToNow(this.build.dateTime);
    });
  }

  unsubscribeFromBuildDetails(): void {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }

    if (this.buildSub) {
      this.buildSub.unsubscribe();
    }

    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  subscribeToJobDetails(jobId: number): void {
    this.termSub = this.dataService.socketOutput
      .subscribe(event => {
        if (event.type === 'data' || event.type === 'exit' || event.type === 'container' || event.type === 'jobLog') {
          if (Number(event.job_id) === Number(jobId) || event.type === 'jobLog') {
            this.terminalInput = event.data;
          }
        } else if (event.type === 'job stopped' && event.data === jobId) {
          this.job.processing = false;
        } else if (event.type === 'job restarted' && event.data === jobId) {
          this.job.processing = false;
        } else if (event.type === 'exposed ports') {
          const portData = event.data && event.data.info || null;

          if (portData && portData['22/tcp']) {
            const port = portData['22/tcp'][0].HostPort;
            this.sshd = `${document.location.hostname}:${port}`;
          }

          if (portData && portData['5900/tcp']) {
            const port = portData['5900/tcp'][0].HostPort;
            this.vnc = `${document.location.hostname}:${port}`;
          }
        } else if (event.type === 'debug') {
          const debug = event.data || 'false';
          this.debug = debug === 'true';
        }
      });

    this.dataService.socketInput.emit({ type: 'subscribeToJobOutput', data: { jobId } });

    this.jobSub = this.dataService.socketOutput
      .pipe(
        filter(event => event.type === 'process'),
        filter((event: any) => Number(event.job_id) === Number(jobId))
      )
      .subscribe(event => {
        if (!this.jobRun) {
          return;
        }

        if (event.data === 'job started') {
          this.jobRun.status = 'running';
          this.jobRun.end_time = null;
          this.jobRun.start_time = event.additionalData;
        } else if (event.data === 'job succeded') {
          this.jobRun.status = 'success';
          this.jobRun.end_time = event.additionalData;
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        } else if (event.data === 'job failed') {
          this.jobRun.status = 'failed';
          this.jobRun.end_time = event.additionalData;
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        }

        // this.setFavicon();
      });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.dateTimeToNow = distanceInWordsToNow(this.dateTime);
    });
  }

  unsubscribeFromJobDetails(): void {
    if (this.jobSub) {
      this.jobSub.unsubscribe();
    }

    if (this.termSub) {
      this.termSub.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  resetFields(): void {
    this.builds = [];
    this.loading = true;
    this.fetchingBuilds = false;
    this.show = 'all';
    this.limit = 5;
    this.offset = 0;
    this.userId = 1;
    this.currentTime = new Date().getTime();
  }

  private generateBuild(build: any): Promise<Build> {
    let status: BuildStatus = BuildStatus.queued;
    let maxCompletedJobTime: number;
    let minRunningJobStartTime: number;
    let buildTime: number = null;
    const currentTime = 0;
    let tag: string = null;
    let dateTime: string = null;
    let id: number = build.id || null;
    let pr: number = null;
    let repo_name: string = null;
    let branch: string = null;
    let sha: string = null;

    return Promise.resolve()
      .then(() => {
        const data = build.data;

        if (build.jobs) {
          if (build.jobs.findIndex(job => job.status === 'failed') !== -1) {
            status = BuildStatus.failed;
          }
          if (build.jobs.findIndex(job => job.status === 'running') !== -1) {
            status = BuildStatus.running;
          }
          if (build.jobs.length === build.jobs.filter(job => job.status === 'success').length) {
            status = BuildStatus.passed;
          }

          maxCompletedJobTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
          minRunningJobStartTime = Math.min(...build.jobs.filter(job => job.status === 'running').map(job => job.start_time));

          if (status === BuildStatus.running && maxCompletedJobTime && minRunningJobStartTime) {
            if (maxCompletedJobTime > (currentTime - minRunningJobStartTime)) {
              buildTime = maxCompletedJobTime;
            } else if (maxCompletedJobTime <= (currentTime - minRunningJobStartTime)) {
              buildTime = currentTime - minRunningJobStartTime;
            }
          } else if (status !== BuildStatus.running) {
            buildTime = maxCompletedJobTime;
          }
        }

        if (data.ref && data.ref.startsWith('refs/tags')) {
          tag = data.ref.replace('refs/tags', '');
        }

        if (build.pr) {
          pr = build.pr;
        }

        // repo name
        if (build.repository && build.repository.full_nmae) {
          repo_name = build.repository.full_name;
        } else {
          repo_name = data.repository.full_name;
        }

        // branch
        if (build.branch) {
          branch = build.branch;
        }

        // commit sha
        if (data && data.pull_request && data.pull_request.head && data.pull_request.head.sha) {
          sha = data.pull_request.head.sha;
        } else if (!data.pull_request && data.after) {
          sha = data.after;
        } else if (!data.pull_request && !data.after && data.sha) {
          sha = data.sha;
        } else if (!data.pull_request && !data.after && !data.sha && data.object_attributes && data.object_attributes.last_commit) {
          sha = data.object_attributes.last_commit.id;
        } else if (data.push && data.push.changes) {
          sha = data.push.changes[0].commits[0].hash;
        } else if (data.pullrequest) {
          sha = data.pullrequest.source.commit.hash;
        } else if (data.pull_request) {
          sha = data.pull_request.source.commit.hash;
        } else if (data.commit) {
          sha = data.commit.id;
        }

        if (!build.pr &&
          (data.object && data.object.kind && data.object_kind !== 'merge_request') &&
          (data.pull_request && !data.pull_request) && !tag
        ) {
          id = build.id;
        }

        dateTime = data.pull_request && data.pull_request.updated_at ||
          data.commit && data.commit.author && data.commit.author.date ||
          data.commits && data.commits[data.commits.length - 1] && data.commits[data.commits.length - 1].timestamp ||
          data.head_commit && data.head_commit.timestamp ||
          null;

        if (build.repository.repository_provider === 'github') {
          return this.extractGitHubData(data);
        } else if (build.repository.repository_provider === 'bitbucket') { // bitbucket
          return this.extractBitbucketData(data);
        } else if (build.repository.repository_provider === 'gitlab') { // gitlab
          return this.extractGitlabData(data, build.repository);
        } else if (build.repository.repository_provider === 'gogs') { // gogs
          return this.extractGogsData(data);
        }
      })
      .then(pdata => {
        const jobs = build.jobs ? build.jobs.map(job => this.generateJob(job, build.id)) : [];
        return new Build(
          id,
          pr,
          repo_name,
          branch,
          sha,
          tag,
          pdata.nameAuthor,
          pdata.authorAvatar,
          pdata.nameCommitter,
          pdata.committerAvatar,
          pdata.commitMessage,
          pdata.dateTime || dateTime,
          buildTime,
          status,
          jobs
        );
      });
  }

  private generateJob(data: any, buildId: number): BuildJob {
    const status = data.status === 'success' ? BuildStatus.passed : data.status;
    return new BuildJob(data.id, buildId, data.data.image, data.data.env, data.start_time, data.end_time, status, data.runs);
  }

  private extractGitHubData(data: any): Promise<ProviderData> {
    const providerData: ProviderData = {};
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          if (data.commit) {
            providerData.commitMessage = data.commit.message;
          } else if (data.commits && data.commits.length) {
            const len = data.commits.length - 1;
            providerData.commitMessage = data.commits[len].message;
          } else if (data.pull_request && data.pull_request.title) { // TODO: change this!
            providerData.commitMessage = data.pull_request.title;
          } else if (data.head_commit) {
            providerData.commitMessage = data.head_commit.message;
          }

          if (data.sha) {
            providerData.committerAvatar = data.committer.avatar_url;
            providerData.nameCommitter = data.commit.committer.name;
            providerData.authorAvatar = data.author.avatar_url;
            providerData.nameAuthor = data.commit.author.name;
            resolve();
          } else if (data.head_commit) {
            const commit = data.head_commit;
            providerData.committerAvatar = data.sender.avatar_url;
            providerData.nameAuthor = data.head_commit.author.name;
            providerData.nameCommitter = data.head_commit.committer.name;

            if (commit.author.username !== commit.committer.username) {
              providerData.nameCommitter = commit.committer.name;

              const url = `https://api.github.com/users/${commit.author.username}`;
              return this.customGet(url)
                .then(resp => providerData.authorAvatar = resp.avatar_url)
                .then(() => resolve())
                .catch(err => resolve());
            } else {
              providerData.authorAvatar = providerData.committerAvatar;
              providerData.nameCommitter = providerData.nameAuthor;
              resolve();
            }
          } else if (data.pull_request) {
            providerData.authorAvatar = data.sender.avatar_url;
            providerData.committerAvatar = providerData.authorAvatar;

            return this.customGet(`https://api.github.com/users/${data.sender.login}`)
              .then(resp => providerData.nameAuthor = resp.name)
              .then(() => this.customGet(`https://api.github.com/users/${data.pull_request.user.login}`))
              .then(resp => providerData.nameCommitter = resp.name)
              .then(() => resolve())
              .catch(err => resolve());
          }
        });
      })
      .then(() => providerData);
  }

  private extractBitbucketData(data: any): Promise<ProviderData> {
    const providerData: ProviderData = {};
    return Promise.resolve()
      .then(() => {
        if (data.actor) {
          providerData.authorAvatar = data.actor.links.avatar.href;
          providerData.nameAuthor = data.actor.display_name;
        }

        if (data.push) {
          providerData.commitMessage = data.push.changes[0].commits[0].message;
          providerData.dateTime = data.push.changes[0].commits[0].date;
          providerData.committerAvatar = data.push.changes[0].commits[0].author.user.links.avatar.href;
          providerData.nameCommitter = data.push.changes[0].commits[0].author.user.display_name;
        } else if (data.pullrequest) {
          providerData.commitMessage = data.pullrequest.description;
          providerData.dateTime = data.pullrequest.updated_on;
          providerData.committerAvatar = data.pullrequest.author.links.avatar.href;
          providerData.nameAuthor = data.pullrequest.author.display_name;
          providerData.nameCommitter = providerData.nameAuthor;
        }
      })
      .then(() => providerData);
  }

  private extractGitlabData(data: any, repositoryData: any): Promise<ProviderData> {
    const providerData: ProviderData = {};
    return Promise.resolve()
      .then(() => {
        return new Promise((resolve, reject) => {
          if (data.commit) {
            providerData.dateTime = data.commit.created_at;
            providerData.commitMessage = data.commit.message;
            providerData.nameCommitter = data.commit.committer_name;
            providerData.nameAuthor = data.commit.author_name;

            const url = repositoryData.api_url + `/users`;
            const params = new HttpParams();
            params.set('username', repositoryData.user_login);
            this.customGet(url, params)
              .then(userData => providerData.authorAvatar = userData[0].avatar_url)
              .then(() => resolve())
              .catch(err => resolve());
          } else if (data.user_avatar) {
            providerData.authorAvatar = data.user_avatar;
            providerData.commitMessage = data.commits[0].message;
            providerData.dateTime = data.commits[0].timestamp;
            providerData.committerAvatar = providerData.authorAvatar;
            providerData.nameAuthor = data.user_name;
            providerData.nameCommitter = data.commits[0].author.name;
            resolve();
          } else if (data.object_attributes) {
            providerData.authorAvatar = data.user.avatar_url;
            providerData.commitMessage = data.object_attributes.last_commit.message;
            providerData.dateTime = data.object_attributes.last_commit.timestamp;
            providerData.committerAvatar = providerData.authorAvatar;
            providerData.nameAuthor = data.user.name;
            providerData.nameCommitter = data.object_attributes.last_commit.author.name;
            resolve();
          } else {
            resolve();
          }
        });
      })
      .then(() => providerData);
  }

  private extractGogsData(data: any): Promise<ProviderData> {
    const providerData: ProviderData = {};
    return Promise.resolve()
      .then(() => {
        if (data.pusher) {
          providerData.authorAvatar = data.pusher.avatar_url;
          providerData.nameAuthor = data.pusher.username;
        }

        if (data.sender && data.commits) {
          providerData.commitMessage = data.commits[0].message;
          providerData.dateTime = data.commits[0].timestamp;
          providerData.committerAvatar = data.sender.avatar_url;
          providerData.nameCommitter = data.sender.username;
        }

        if (data.pull_request) {
          providerData.authorAvatar = data.pull_request.user.avatar_url;
          providerData.nameAuthor = data.pull_request.user.username;
          providerData.commitMessage = data.pull_request.title;
          providerData.dateTime = data.pull_request.head_repo.updated_at;
        }
      })
      .then(() => providerData);
  }

  private customGet(url: string, params: HttpParams = new HttpParams()): Promise<any> {
    return this.http.get(url, { params })
      .pipe(
        catchError(handleError(url))
      )
      .toPromise();
  }

  private updateJobTimes(): void {
    this.maxCompletedJobTime = Math.max(...this.build.jobs.map(job => job.end_time - job.start_time));
    if (this.build.status === BuildStatus.running) {
      this.minRunningJobStartTime = Math.min(...this.build.jobs
        .filter(job => job.status === BuildStatus.running).map(job => job.start_time));
    }

    this.build.jobs = this.build.jobs.map(job => {
      const lastRun = job.runs && job.runs[job.runs.length - 1].end_time ?
        job.runs[job.runs.length - 1] : job.runs[job.runs.length - 2];
      if (lastRun) {
        job.lastRunTime = lastRun.end_time - lastRun.start_time;
      }

      return job;
    });
  }

  private getBuildStatus(): BuildStatus {
    let status: BuildStatus = BuildStatus.queued;
    let favicon = '/assets/images/favicon-queued.png';

    if (this.build && this.build.jobs) {
      if (this.build.jobs.findIndex(job => job.status === BuildStatus.failed) !== -1) {
        status = BuildStatus.failed;
        favicon = '/assets/images/favicons/favicon-error.png';
      }

      if (this.build.jobs.findIndex(job => job.status === BuildStatus.running) !== -1) {
        status = BuildStatus.running;
        favicon = '/assets/images/favicons/favicon-running.png';
      }

      if (this.build.jobs.length === this.build.jobs.filter(j => j.status === BuildStatus.passed).length) {
        status = BuildStatus.passed;
        favicon = '/assets/images/favicons/favicon-success.png';
      }
    }

    const name = this.build.repository_name;
    if (this.document.getElementById('favicon')) {
      this.document.getElementById('favicon').setAttribute('href', favicon);
    }
    this.titleService.setTitle(`${name} - ${status}`);

    return status;
  }

  private updateBuilds(): void {
    this.builds = this.builds.map(build => {
      let status = BuildStatus.queued;
      if (build.jobs.findIndex(job => job.status === BuildStatus.failed) !== -1) {
        status = BuildStatus.failed;
      }

      if (build.jobs.findIndex(job => job.status === BuildStatus.running) !== -1) {
        status = BuildStatus.running;
      }

      if (build.jobs.length === build.jobs.filter(job => job.status === BuildStatus.passed).length) {
        status = BuildStatus.passed;
      }

      build.maxCompletedJobTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
      build.minRunningJobStartTime = Math.min(...build.jobs
        .filter(job => job.status === 'running')
        .map(job => job.start_time)
      );
      build.status = status;
      return build;
    });
  }
}
