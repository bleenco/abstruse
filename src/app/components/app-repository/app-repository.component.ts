import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
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
  updateInterval: any;
  hideMoreButton: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private api: ApiService,
    private config: ConfigService
  ) {
    this.loading = true;
    this.fetching = false;
    this.limit = 5;
    this.offset = 0;
  }

  ngOnInit() {
    this.tab = 'builds';
    this.url = this.config.url;

    this.route.params.subscribe(params => {
      this.id = params.id || null;
      if (!this.id) {
        this.router.navigate(['repositories']);
      } else {
        this.fetch();
        this.fetchBadge();
        this.fetchTokens();
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
          }
        }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.stopInterval();
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

      this.startInterval();
    });
  }

  fetchLastBuild(): void {
    this.api.getLastBuild().subscribe(build => {
      if (!this.repo.builds) {
        this.repo.builds = [];
      }

      this.repo.builds.unshift(build);
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

  startInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateJobs();
    this.updateInterval = setInterval(() => this.updateJobs(), 1000);
  }

  stopInterval(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  updateJobs(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;

    this.repo.builds = this.repo.builds
      .map(build => {
        build.jobs = build.jobs.map(job => {
          if (!job.end_time || job.status === 'running') {
            job.time = format(currentTime - job.start_time, 'mm:ss');
          } else {
            job.time = format(job.end_time - job.start_time, 'mm:ss');
          }
          return job;
        });

        build.totalTime = format(Math.max(...build.jobs.map(job => {
          let date = new Date();
          let splitted = job.time.split(':');
          date.setUTCMinutes(splitted[0]);
          date.setUTCSeconds(splitted[1]);
          return date;
        })), 'mm:ss');

        return build;
      })
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

        build.status = status;
        build.timeInWords = distanceInWordsToNow(build.created_at);
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
