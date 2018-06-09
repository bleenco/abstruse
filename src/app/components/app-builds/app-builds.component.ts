import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-builds',
  templateUrl: 'app-builds.component.html'
})
export class AppBuildsComponent implements OnInit, OnDestroy {
  loading: boolean;
  fetching: boolean;
  hideMoreButton: boolean;
  subAdded: Subscription;
  sub: Subscription;
  subUpdate: Subscription;
  builds: any[];
  limit: number;
  offset: number;
  userData: any;
  userId: string | null;
  show: 'all' | 'pr' | 'commits';

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.builds = [];
    this.loading = true;
    this.limit = 5;
    this.offset = 0;
    this.show = 'all';
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.userId = this.userData && this.userData.id || null;
    this.fetch();

    this.subAdded = this.socketService.outputEvents
      .pipe(filter(x => x.type !== 'data'))
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.data === 'build added' && event.additionalData) {
          if (!this.builds) {
            this.builds = [];
          }

          this.builds.unshift(event.additionalData);
          this.update();
        }
      });

    this.sub = this.socketService.outputEvents
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
              this.builds[build].jobs[index].status = 'success';
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
            case 'job queued':
              this.builds[build].jobs[index].status = 'queued';
              break;
            case 'job started':
              this.builds[build].jobs[index].status = 'running';
              this.builds[build].jobs[index].start_time = e.additionalData;
              this.builds[build].jobs[index].end_time = null;
              break;
            case 'job failed':
              this.builds[build].jobs[index].status = 'failed';
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
            case 'job stopped':
              this.builds[build].jobs[index].status = 'failed';
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
          }

          this.update();
        }
      });

    this.subUpdate = this.socketService.outputEvents
      .pipe(
        filter(event => event.data === 'build restarted' || event.data === 'build succeeded' || event.data === 'build failed')
      )
      .subscribe(event => {
        let index = this.builds.findIndex(i => i.id === event.build_id);
        if (index !== -1) {
          if (event.data === 'build restarted') {
            this.builds[index].start_time = event.additionalData;
          } else {
            this.builds[index].end_time = event.additionalData;
            this.update();
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }

    if (this.subAdded) {
      this.subAdded.unsubscribe();
    }

    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  update(): void {
    this.builds = this.builds.map(build => {
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
        .map(job => job.start_time)
      );
      build.status = status;
      build.userId = this.userId;
      return build;
    });
  }

  fetch(e?: MouseEvent): void {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.fetching = true;
    this.apiService.getBuilds(
      this.limit,
      this.offset,
      this.show,
      this.userId
    ).subscribe(builds => {
      this.builds = this.builds.concat(builds);
      this.loading = false;
      this.fetching = false;
      if (builds.length === this.limit) {
        this.offset += 5;
        this.hideMoreButton = false;
      } else {
        this.hideMoreButton = true;
      }

      this.update();
    });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }

  showAllBuilds(): void {
    this.loading = true;
    this.show = 'all';
    this.builds = [];
    this.offset = 0;
    this.fetch();
  }

  showPullRequests(): void {
    this.loading = true;
    this.show = 'pr';
    this.builds = [];
    this.offset = 0;
    this.fetch();
  }

  showCommits(): void {
    this.loading = true;
    this.show = 'commits';
    this.builds = [];
    this.offset = 0;
    this.fetch();
  }
}
