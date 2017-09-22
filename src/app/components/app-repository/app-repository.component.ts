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
  tab: 'builds' | 'settings';
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

    this.tab = 'settings';
    this.url = this.config.url;

    this.route.params.subscribe(params => {
      this.id = params.id || null;
      if (!this.id) {
        this.router.navigate(['repositories']);
      } else {
        this.fetch();
        this.fetchBuilds();
        this.fetchBadge();

        if (this.userId) {
          this.fetchTokens();
        }
      }
    });

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
                this.repo.builds[index].jobs[jobIndex].end_time = new Date();
              break;
              case 'job queued':
                status = 'queued';
              break;
              case 'job started':
                status = 'running';
                this.repo.builds[index].jobs[jobIndex].start_time = new Date();
              break;
              case 'job failed':
                status = 'failed';
                this.repo.builds[index].jobs[jobIndex].start_time = new Date();
              break;
              case 'job stopped':
                status = 'failed';
                this.repo.builds[index].jobs[jobIndex].end_time = new Date();
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

        if (status !== 'running') {
          if (build.end_time > build.start_time) {
            build.maxTime = build.end_time - build.start_time;
          } else {
            build.maxTime = new Date().getTime() - build.start_time;
          }
        }

        build.startTime = Math.min(...build.jobs
          .filter(job => job.status === 'running')
          .map(job => job.start_time));
        build.status = status;
        return build;
      });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
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
    this.api.addNewEnvironmentVariable(this.environmentVariableForm)
      .subscribe(() => this.fetch());

    this.environmentVariableForm = {
      name: null, value: null, repositories_id: null, encrypted: 0
    };
  }

  removeVariable(id: number): void {
    this.api.removeNewEnvironmentVariable(id)
      .subscribe(() => this.fetch());
  }
}
