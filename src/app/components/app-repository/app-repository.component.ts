import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { Subscription } from 'rxjs/Subscription';
import { format, distanceInWordsToNow } from 'date-fns';
import 'rxjs/add/operator/delay';

export interface IRepoForm {
  id: number;
  access_tokens_id: any;
  repository_provider: string;
  api_url: string;
  public: boolean;
}

export interface VariableForm {
  name: string;
  value: string;
  repositories_id: number;
  encrypted: number;
}

@Component({
  selector: 'app-repository',
  templateUrl: 'app-repository.component.html'
})
export class AppRepositoryComponent implements OnInit, OnDestroy {
  loading: boolean;
  fetching: boolean;
  sub: Subscription;
  subUpdate: Subscription;
  tab: string;
  id: string;
  repo: any;
  url: string;
  statusBadge: string;
  tokens: any[];
  saving: boolean;
  form: IRepoForm;
  limit: number;
  offset: number;
  hideMoreButton: boolean;
  userData: any;
  userId: string | null;
  environmentVariableForm: VariableForm;
  accessTokensOptions: { key: string, value: string }[];
  yesNoOptions: { key: number, value: string }[];
  checkingConfig: boolean;
  checkConfigResult: { read: boolean; config: boolean; };
  repositoryProviders: { key: string, value: string }[];
  triggeringBuild: boolean;
  buildSuccessfullyTriggered: boolean;
  buildTriggerError: boolean;
  addingEnvVar: boolean;
  fetchingConfig: boolean;
  configFile: string;
  runningConfigBuild: boolean;
  configBuildStatus: boolean;
  cache: any[];
  cacheDeleted: boolean;
  fetchingCache: boolean;
  deletingCache: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private api: ApiService,
    private authService: AuthService,
    private config: ConfigService
  ) {
    this.loading = true;
    this.fetching = false;
    this.limit = 5;
    this.offset = 0;
    this.environmentVariableForm = {
      name: null, value: null, repositories_id: null, encrypted: 0
    };

    this.accessTokensOptions = [];
    this.yesNoOptions = [ { key: 0, value: 'No' }, { key: 1, value: 'Yes' } ];
    this.repositoryProviders = [
      { key: 'github', value: 'GitHub' },
      { key: 'gitlab', value: 'GitLab' },
      { key: 'bitbucket', value: 'BitBucket' },
      { key: 'gogs', value: 'Gogs' }
    ];
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.userId = this.userData && this.userData.id || null;

    this.url = this.config.url;

    this.id = this.route.snapshot.params.id;
    const queryParams = this.route.snapshot.queryParams.tab;
    if (!queryParams) {
      this.router.navigate(['/repo', this.id], { queryParams: { tab: 'builds' } });
      this.tab = 'builds';
    } else {
      this.tab = queryParams;
    }

    if (!this.id) {
      this.router.navigate(['repositories']);
    } else {
      this.fetch();
      this.fetchBuilds();
      this.fetchBadge();
      this.fetchCache();

      if (this.userId) {
        this.fetchTokens();
      }
    }

    this.sub = this.socketService.outputEvents
      .filter(x => x.type !== 'data')
      .subscribe(event => {
        if (!this.repo || !event.data) {
          return;
        }

        if (event.data === 'build added' && event.repository_id
            && event.repository_id === this.id && event.additionalData) {
          if (!this.repo.builds) {
            this.repo.builds = [];
          }

          this.repo.builds.unshift(event.additionalData);
          this.updateJobs();
        }

        const index = this.repo.builds.findIndex(build => build.id === event.build_id);
        if (index !== -1) {
          const jobIndex = this.repo.builds[index].jobs.findIndex(job => job.id === event.job_id);
          if (jobIndex !== -1) {
            let status = null;
            switch (event.data) {
              case 'job succeded':
                status = 'success';
                this.repo.builds[index].jobs[jobIndex].end_time = event.additionalData;
              break;
              case 'job queued':
                status = 'queued';
              break;
              case 'job started':
                status = 'running';
                this.repo.builds[index].jobs[jobIndex].start_time = event.additionalData;
              break;
              case 'job failed':
                status = 'failed';
                this.repo.builds[index].jobs[jobIndex].start_time = event.additionalData;
              break;
              case 'job stopped':
                status = 'failed';
                this.repo.builds[index].jobs[jobIndex].end_time = event.additionalData;
              break;
            }

            this.repo.builds[index].jobs[jobIndex].status = status;

            this.updateJobs();
          }
        }
      });

    this.subUpdate = this.socketService.outputEvents
      .filter(event => event.data === 'build restarted' || event.data === 'build succeeded'
        || event.data === 'build failed')
      .subscribe(event => {
        let index = this.repo.builds.findIndex(i => i.id === event.build_id);
        if (index !== -1) {
          if (event.data === 'build restarted') {
            this.repo.builds[index].start_time = event.additionalData;
            this.updateJobs();
          } else {
            this.repo.builds[index].end_time = event.additionalData;
            this.updateJobs();
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
  }

  switchTab(tab: string): void {
    if (this.route.snapshot.queryParams.tab === tab) {
      return;
    } else {
      this.router.navigate(['repo', this.id], { queryParams: { tab: tab } });
      this.tab = tab;
    }
  }

  fetch(): void {
    this.api.getRepository(this.id, this.userId).subscribe(event => {
      this.repo = event;
      this.form = {
        id: parseInt(this.id, 10),
        access_tokens_id: event.access_tokens_id,
        repository_provider: event.repository_provider,
        api_url: event.api_url,
        public: event.public
      };
      this.loading = false;
    });
  }

  fetchBuilds(e?: MouseEvent): void {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.fetching = true;
    this.api.getRepositoryBuilds(this.id, this.limit, this.offset).subscribe(builds => {
      if (!this.repo.builds) {
        this.repo.builds = [];
      }

      this.repo.builds = this.repo.builds.concat(builds);
      this.fetching = false;
      if (builds.length === this.limit) {
        this.offset += 5;
      } else {
        this.hideMoreButton = true;
      }

      this.updateJobs();
    });
  }

  fetchBadge(): void {
    this.api.getBadge(parseInt(this.id, 10)).subscribe(event => {
      if (event.ok) {
        this.statusBadge = event._body.replace(/ \r/g, '').trim();
      }
    });
  }

  fetchTokens(): void {
    this.api.getAllTokens().subscribe(tokens => {
      this.accessTokensOptions = tokens.map(token => {
        return { key: token.id, value: token.user.fullname + '`s ' + token.description };
      });
    });
  }

  updateJobs(): void {
    this.repo.builds = this.repo.builds
      .map(build => {
        let status = 'queued';
        if (build.jobs.findIndex(job => job.status === 'failed') !== -1) {
          status = 'failed';
        }

        if (build.jobs.findIndex(job => job.status === 'running') !== -1) {
          status = 'running';
        }

        if (build.jobs.length === build.jobs.filter(job => job.status === 'success').length) {
          status = 'success';
        }

        build.maxCompletedJobTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
        build.minRunningJobStartTime = Math.min(...build.jobs
          .filter(job => job.status === 'running')
          .map(job => job.start_time));
        build.status = status;
        return build;
      });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }

  fetchCache(): void {
    this.fetchingCache = true;
    this.cache = [];

    this.api.fetchCacheForRepository(Number(this.id)).subscribe(cache => {
      this.cache = cache;
      this.fetchingCache = false;
    });
  }

  deleteCache(): void {
    this.deletingCache = true;
    this.api.deleteCacheForRepository(Number(this.id)).subscribe(status => {
      this.cacheDeleted = true;
      this.deletingCache = false;
      this.fetchCache();
    });
  }

  checkRepositoryConfig(): void {
    this.checkingConfig = true;
    this.checkConfigResult = null;
    this.api.checkRepositoryConfiguration(Number(this.id)).subscribe(ev => {
      this.checkConfigResult = ev;
      this.checkingConfig = false;
    });
  }

  triggerTestBuild(): void {
    this.triggeringBuild = true;
    this.buildSuccessfullyTriggered = false;
    this.buildTriggerError = false;

    this.api.triggerTestBuild(Number(this.id)).subscribe(ev => {
      if (ev) {
        this.buildSuccessfullyTriggered = true;
      } else {
        this.buildTriggerError = true;
      }
      this.triggeringBuild = false;
    });
  }

  fetchConfigFile(): void {
    this.fetchingConfig = true;

    this.api.getRepositoryConfigRawFile(Number(this.id)).subscribe(ev => {
      this.fetchingConfig = false;
      this.configFile = ev;
    });
  }

  runConfigBuild(): void {
    this.runningConfigBuild = true;
    const cfg = {
      config: this.configFile,
      id: this.id
    };

    this.api.runRepositoryBuildFromConfig(cfg).subscribe(ev => {
      this.configBuildStatus = ev;
      this.runningConfigBuild = false;
    });
  }

  saveRepoSettings(e: MouseEvent): void {
    this.saving = true;

    this.api.saveRepositorySettings(this.form)
      .delay(1000)
      .subscribe(saved => {
        if (saved) {
          this.saving = false;
        }
      });
  }

  addEnvironmentVariable(): void {
    this.environmentVariableForm.repositories_id = this.repo.id;
    this.addingEnvVar = true;
    this.api.addNewEnvironmentVariable(this.environmentVariableForm)
      .delay(500)
      .subscribe(() => {
        this.addingEnvVar = false;
        this.fetch();
      });

    this.environmentVariableForm = {
      name: null, value: null, repositories_id: null, encrypted: 0
    };
  }

  removeVariable(id: number): void {
    this.api.removeNewEnvironmentVariable(id)
      .subscribe(() => this.fetch());
  }
}
