import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../shared/providers/data.service';
import { TimeService } from '../../shared/providers/time.service';
import { BuildStatus, Build, BuildJob } from './build.model';
import { getAPIURL, handleError } from '../../core/shared/shared-functions';
import { JSONResponse } from '../../core/shared/shared.model';
import { Observable, of, throwError, concat } from 'rxjs';
import { catchError, map, concatMap, toArray } from 'rxjs/operators';

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

  constructor(
    public http: HttpClient,
    public dataService: DataService,
    public timeService: TimeService,
    private titleService: Title,
    @Inject(DOCUMENT) private document: any,
  ) { }

  fetchBuilds(limit: number, offset: number, show: 'all' | 'pr' | 'commits', repoId?: number): Observable<Build[]> {
    const url = repoId ? getAPIURL() + '/repositories/' + repoId + '/builds' : getAPIURL() + `/builds`;
    let params = new HttpParams();
    params = params.append('limit', String(limit));
    params = params.append('offset', String(offset));
    params = params.append('filter', show);

    return this.http.get<JSONResponse>(url, { params })
      .pipe(
        concatMap(resp => {
          if (resp && resp.data && resp.data.length) {
            return concat(...resp.data.map(build => this.generateBuild(build))).pipe(toArray());
          } else {
            return of([]);
          }
        }),
        map((builds: Build[]) => this.updateBuilds(builds))
      );
  }

  fetchBuild(buildId: number): Observable<Build> {
    const url = getAPIURL() + `/builds/${buildId}`;

    return this.http.get<JSONResponse>(url)
      .pipe(
        concatMap(resp => {
          if (resp && resp.data) {
            return this.generateBuild(resp.data);
          } else {
            return throwError('not found');
          }
        }),
        map((build: Build) => {
          build.status = this.getBuildStatus(build);
          return build;
        })
      );
  }

  fetchJob(buildId: number, jobId: number): Observable<BuildJob> {
    const url = getAPIURL() + `/builds/${buildId}/${jobId}`;
    let job: BuildJob;

    return this.http.get<JSONResponse>(url)
      .pipe(
        map(resp => {
          if (resp && resp.data) {
            job = this.generateJob(resp.data, resp.data.build.id);
            return resp.data.build;
          } else {
            return;
          }
        }),
        concatMap(build => {
          if (!build) {
            return throwError('no data');
          }

          return this.generateBuild(build, build.created_at);
        }),
        map(build => {
          job.build = build;
          return job;
        })
      );
  }

  generateBuild(build: any, created_at?: number): Observable<Build> {
    return new Observable(observer => {
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

      Promise.resolve().then(() => {
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
          Boolean(build.hasPermission),
          jobs
        );
      })
      .then((b: Build) => {
        if (created_at) {
          b.created_at = created_at;
        }
        observer.next(b);
        observer.complete();
      })
      .catch(err => {
        observer.error(err);
        observer.complete();
      });
    });
  }

  updateBuilds(builds: Build[]): Build[] {
    return builds.map(build => {
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

  updateJobTimes(build: Build): { build: Build, maxCompletedJobTime: number, minRunningJobStartTime: number} {
    const maxCompletedJobTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
    let minRunningJobStartTime;
    if (build.status === BuildStatus.running) {
      minRunningJobStartTime = Math.min(...build.jobs
        .filter(job => job.status === BuildStatus.running).map(job => job.start_time));
    }

    build.jobs = build.jobs.map(job => {
      const lastRun = job.runs && job.runs[job.runs.length - 1].end_time ?
        job.runs[job.runs.length - 1] : job.runs[job.runs.length - 2];
      if (lastRun) {
        job.lastRunTime = lastRun.end_time - lastRun.start_time;
      }

      return job;
    });

    return { build, maxCompletedJobTime, minRunningJobStartTime };
  }

  getBuildStatus(build: Build): BuildStatus {
    let status: BuildStatus = BuildStatus.queued;
    let favicon = '/assets/images/favicon-queued.png';

    if (build && build.jobs && build.jobs.length) {
      if (build.jobs.findIndex(job => job.status === BuildStatus.failed) !== -1) {
        status = BuildStatus.failed;
        favicon = '/assets/images/favicons/favicon-error.png';
      }

      if (build.jobs.findIndex(job => job.status === BuildStatus.running) !== -1) {
        status = BuildStatus.running;
        favicon = '/assets/images/favicons/favicon-running.png';
      }

      if (build.jobs.length === build.jobs.filter(j => j.status === BuildStatus.passed).length) {
        status = BuildStatus.passed;
        favicon = '/assets/images/favicons/favicon-success.png';
      }
    }

    const name = build.repository_name;
    if (this.document.getElementById('favicon')) {
      this.document.getElementById('favicon').setAttribute('href', favicon);
    }
    this.titleService.setTitle(`${name} - ${status}`);

    return status;
  }

  setFavicon(name: string, status: string): void {
    let favicon;
    switch (status) {
      case 'queued': favicon = 'assets/images/favicons/favicon-queued.png'; break;
      case 'failed': favicon = 'assets/images/favicons/favicon-error.png'; break;
      case 'running': favicon = 'assets/images/favicons/favicon-running.png'; break;
      case 'success': favicon = 'assets/images/favicons/favicon-success.png'; break;
      default: favicon = 'assets/images/favicons/favicon.png'; break;
    }

    this.titleService.setTitle(`${name} - ${status}`);
    if (this.document.getElementById('favicon')) {
      this.document.getElementById('favicon').setAttribute('href', favicon);
    }
  }

  private generateJob(data: any, buildId: number): BuildJob {
    const status = data.status === 'success' ? BuildStatus.passed : data.status;
    return new BuildJob(
      data.id, buildId, data.data.image, data.data.env, data.start_time, data.end_time, status, Boolean(data.hasPermission), data.runs
    );
  }

  private async extractGitHubData(data: any): Promise<ProviderData> {
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

  private async extractBitbucketData(data: any): Promise<ProviderData> {
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

  private async extractGitlabData(data: any, repositoryData: any): Promise<ProviderData> {
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

  private async extractGogsData(data: any): Promise<ProviderData> {
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

  private async customGet(url: string, params: HttpParams = new HttpParams()): Promise<any> {
    return this.http.get(url, { params })
      .pipe(
        catchError(handleError(url))
      )
      .toPromise();
  }
}
