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
}

@Component({
  selector: 'app-repository',
  templateUrl: 'app-repository.component.html'
})
export class AppRepositoryComponent implements OnInit, OnDestroy {
  loading: boolean;
  fetching: boolean;
  sub: Subscription;
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
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.userId = this.userData && this.userData.id || null;

    this.tab = 'builds';
    this.url = this.config.url;

    this.route.params.subscribe(params => {
      this.id = params.id || null;
      if (!this.id) {
        this.router.navigate(['repositories']);
      } else {
        this.fetch();
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

        if (event.data === 'buildAdded' && event.repository_id && event.repository_id === this.id) {
          this.fetchLastBuild();
        }

        const index = this.repo.builds.findIndex(build => build.id === event.build_id);
        if (index !== -1) {
          const jobIndex = this.repo.builds[index].jobs.findIndex(job => job.id === event.job_id);
          if (jobIndex !== -1) {
            let status = null;
            switch (event.data) {
              case 'jobSucceded':
                status = 'success';
                this.repo.builds[index].jobs[jobIndex].end_time = new Date();
              break;
              case 'jobQueued':
                status = 'queued';
              break;
              case 'jobStarted':
                status = 'running';
                this.repo.builds[index].jobs[jobIndex].start_time = new Date();
              break;
              case 'jobFailed':
                status = 'failed';
                this.repo.builds[index].jobs[jobIndex].start_time = new Date();
              break;
              case 'jobStopped':
                status = 'failed';
                this.repo.builds[index].jobs[jobIndex].end_time = new Date();
              break;
            }

            this.repo.builds[index].jobs[jobIndex].status = status;

            this.updateJobs();
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  fetch(): void {
    this.api.getRepository(this.id).subscribe(event => {
      this.repo = event;
      this.form = { id: parseInt(this.id, 10), access_tokens_id: event.access_tokens_id };
      this.loading = false;
      this.fetchBuilds();
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

  fetchLastBuild(): void {
    this.api.getLastBuild(this.userId).subscribe(build => {
      if (!this.repo.builds) {
        this.repo.builds = [];
      }

      this.repo.builds.unshift(build);
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
      this.tokens = tokens;
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
          build.maxTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
        } else {
          build.maxTime = Math.max(...build.jobs.map(job => job.start_time));
        }

        build.status = status;
        return build;
      });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
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
}
