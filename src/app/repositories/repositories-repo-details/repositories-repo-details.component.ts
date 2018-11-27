import { Component, OnInit, OnDestroy } from '@angular/core';
import { RepositoriesService } from '../shared/repositories.service';
import { Repository, AccessToken, EnvForm } from '../shared/repository.model';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../../builds/shared/build.service';
import { User } from '../../team/shared/team.model';
import { AuthService } from '../../shared/providers/auth.service';
import { Build, BuildStatus } from '../../builds/shared/build.model';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/providers/data.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-repositories-repo-details',
  templateUrl: './repositories-repo-details.component.html',
  styleUrls: ['./repositories-repo-details.component.sass']
})
export class RepositoriesRepoDetailsComponent implements OnInit, OnDestroy {
  tab: 'builds' | 'settings' | 'check';
  id: number;
  repo: Repository;
  fetchingRepository: boolean;
  limit: number;
  offset: number;
  accessTokens: AccessToken[] = [];
  tokenOptions: { value: string | number, placeholder: string }[] = [];
  fetchingAccessTokens: boolean;
  envVariablesForm: EnvForm = new EnvForm('', '', false);
  encryptedOptions = [{ value: true, placeholder: 'Encrypted' }, { value: false, placeholder: 'Plain' }];
  loading: boolean;
  fetchingBuilds: boolean;
  builds: Build[] = [];
  hideMoreButton: boolean;
  buildsSubAdded: Subscription;
  buildsSub: Subscription;
  buildsSubUpdate: Subscription;

  constructor(
    public service: RepositoriesService,
    public route: ActivatedRoute,
    public buildService: BuildService,
    public authService: AuthService,
    public dataService: DataService
  ) { }

  ngOnInit() {
    this.tab = 'builds';
    this.id = this.route.snapshot.params.id;
    this.resetFields();
    this.fetchRepository();
    this.fetchBuilds();
    this.subscribeToBuilds();
  }

  ngOnDestroy() {
    this.repo = null;
    this.resetFields();
    this.unsubscribeFromBuilds();
  }

  switchTab(tab: 'builds' | 'settings' | 'check'): void {
    if (this.tab === tab) {
      return;
    }
    this.tab = tab;

    if (this.tab === 'settings') {
      this.envVariablesForm = new EnvForm('', '', false);
      this.fetchAccessTokens();
    }
  }

  private subscribeToBuilds(): void {
    this.buildsSubAdded = this.dataService.socketOutput
      .pipe(
        filter(x => x.type !== 'data')
      )
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.data === 'build added' &&
          event.additionalData &&
          event.additionalData.repository &&
          Number(event.additionalData.repository.id) === Number(this.id)) {
          if (!this.builds) {
            this.builds = [];
          }

          Promise.resolve()
            .then(() => this.buildService.generateBuild(event.additionalData).toPromise())
            .then((build: Build) => this.builds.unshift(build))
            .then(() => this.buildService.updateBuilds(this.builds));
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
          const job = this.builds[build].jobs[index];
          switch (e.data) {
            case 'job succeded':
              if (job.status === BuildStatus.running) {
                job.end_time = e.additionalData;
              } else {
                job.end_time = null;
              }
              job.status = BuildStatus.passed;
              break;
            case 'job queued':
              job.status = BuildStatus.queued;
              break;
            case 'job started':
              job.status = BuildStatus.running;
              job.start_time = e.additionalData;
              job.end_time = null;
              break;
            case 'job failed':
              if (job.status === BuildStatus.running) {
                job.end_time = e.additionalData;
              } else {
                job.end_time = null;
              }
              job.status = BuildStatus.failed;
              break;
            case 'job stopped':
              if (job.status === BuildStatus.running) {
                job.end_time = e.additionalData;
              }
              job.status = BuildStatus.failed;
              break;
          }

          this.buildService.updateBuilds(this.builds);
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
            this.buildService.updateBuilds(this.builds);
          }
        }
      });
  }

  private unsubscribeFromBuilds(): void {
    if (this.buildsSubAdded) {
      this.buildsSubAdded.unsubscribe();
    }
    if (this.buildsSub) {
      this.buildsSub.unsubscribe();
    }
    if (this.buildsSubUpdate) {
      this.buildsSubUpdate.unsubscribe();
    }
  }

  private fetchRepository(): void {
    this.fetchingRepository = true;
    this.service.fetchRepository(this.id).subscribe(resp => {
      if (resp && resp.data) {
        const repo = resp.data;
        const provider = repo.repository_provider;
        let provider_id = null;
        switch (provider) {
          case 'github': provider_id = repo.github_id; break;
          case 'bitbucket': provider_id = repo.bitbucket_id; break;
          case 'gitlab': provider_id = repo.gitlab_id; break;
          case 'gogs': provider_id = repo.gogs_id; break;
        }

        this.repo = new Repository(
          repo.id,
          repo.name,
          repo.full_name,
          provider,
          provider_id,
          repo.html_url,
          repo.api_url,
          repo.default_branch,
          repo.description,
          Boolean(repo.fork),
          Boolean(repo.public),
          repo.access_tokens_id
        );
      }

      this.fetchingRepository = false;
    });
  }

  private fetchBuilds(): void {
    this.fetchingBuilds = true;
    this.buildService.fetchBuilds(this.limit, this.offset, 'all', this.id)
      .subscribe((builds: Build[]) => {
        this.builds = this.builds.concat(builds.sort((a, b) => b.id - a.id));
        this.loading = false;
        this.fetchingBuilds = false;
        if (builds.length === this.limit) {
          this.offset += 5;
          this.hideMoreButton = false;
        } else {
          this.hideMoreButton = true;
        }
      });
  }

  private fetchAccessTokens(): void {
    this.fetchingAccessTokens = true;
    this.service.fetchAccessTokens().subscribe(resp => {
      if (resp && resp.data) {
        this.accessTokens = resp.data.map(token => {
          const user = new User(token.user.id, token.user.email, token.user.fullname, token.user.avatar, Boolean(token.user.admin));
          return new AccessToken(token.id, token.description, user);
        });

        this.tokenOptions = this.accessTokens.map(token => {
          return { value: token.id, placeholder: token.user.fullname + '`s ' + token.description };
        });

        this.fetchingAccessTokens = false;
      }
    });
  }

  private resetFields(): void {
    this.builds = [];
    this.loading = true;
    this.fetchingBuilds = true;
    this.limit = 5;
    this.offset = 0;
  }

  checkRepositoryConfiguration(): void {
    this.service.checkRepositoryConfiguration(this.id).subscribe(resp => {
      console.log(resp);
    });
  }
}
