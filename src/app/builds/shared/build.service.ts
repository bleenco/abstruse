import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DataService } from '../../shared/providers/data.service';
import { TimeService } from '../../shared/providers/time.service';
import { BuildStatus, Build, BuildJob } from './build.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { JSONResponse } from '../../core/shared/shared.model';
import { catchError } from 'rxjs/operators';

export interface ProviderData {
  name?: string;
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

  constructor(
    public http: HttpClient,
    public dataService: DataService,
    public timeService: TimeService
  ) {
    this.resetFields();

    this.dataService.socketOutput.subscribe(event => {
      console.log(event);
    });

    this.timeService.getCurrentTime().subscribe(time => this.currentTime = time);
  }

  fetchBuilds(): void {
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
            });
        }
      });
  }

  resetFields(): void {
    this.builds = [];
    this.loading = true;
    this.fetchingBuilds = false;
    this.show = 'all';
    this.limit = 5;
    this.offset = 0;
    this.userId = 1;
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
        return new Build(
          id,
          pr,
          repo_name,
          branch,
          sha,
          tag,
          pdata.name,
          pdata.authorAvatar,
          pdata.committerAvatar,
          pdata.commitMessage,
          pdata.dateTime || dateTime,
          buildTime,
          status
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
            providerData.name = data.commit.committer.name;
            providerData.authorAvatar = data.author.avatar_url;
          } else if (data.head_commit) {
            const commit = data.head_commit;
            providerData.committerAvatar = data.sender.avatar_url;
            providerData.name = commit.author.name;
            resolve();

            if (commit.author.username !== commit.comitter.username) {
              const url = `https://api.github.com/users/${commit.author.username}`;
              return this.customGet(url)
                .then(resp => providerData.authorAvatar = resp.avatar_url)
                .catch(err => resolve());
            } else {
              providerData.authorAvatar = providerData.committerAvatar;
              resolve();
            }
          } else if (data.pull_request) {
            providerData.authorAvatar = data.sender.avatar_url;
            providerData.committerAvatar = providerData.authorAvatar;

            const url = `https://api.github.com/users/${data.sender.login}`;
            return this.customGet(url)
              .then(resp => providerData.name = resp.name)
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
        }

        if (data.push) {
          providerData.commitMessage = data.push.changes[0].commits[0].message;
          providerData.dateTime = data.push.changes[0].commits[0].date;
          providerData.committerAvatar = data.push.changes[0].commits[0].author.user.links.avatar.href;
        } else if (data.pullrequest) {
          providerData.commitMessage = data.pullrequest.description;
          providerData.dateTime = data.pullrequest.updated_on;
          providerData.committerAvatar = data.pullrequest.author.links.avatar.href;
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
            resolve();
          } else if (data.object_attributes) {
            providerData.authorAvatar = data.user.avatar_url;
            providerData.commitMessage = data.object_attributes.last_commit.message;
            providerData.dateTime = data.object_attributes.last_commit.timestamp;
            providerData.committerAvatar = providerData.authorAvatar;
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
        }

        if (data.sender && data.commits) {
          providerData.commitMessage = data.commits[0].message;
          providerData.dateTime = data.commits[0].timestamp;
          providerData.committerAvatar = data.sender.avatar_url;
        }

        if (data.pull_request) {
          providerData.authorAvatar = data.pull_request.user.avatar_url;
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
}
