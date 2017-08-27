import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs/Subscription';
import { format, distanceInWordsToNow } from 'date-fns';

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
  builds: any[];
  limit: number;
  offset: number;
  userData: any;

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
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.fetch();

    this.subAdded = this.socketService.outputEvents
      .filter(x => x.type !== 'data')
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.data === 'buildAdded') {
          this.fetchLastBuild();
        }
      });

    this.sub = this.socketService.outputEvents
      .filter(x => {
        x = x.data ? x.data.toString() : '';
        return x.startsWith('job');
      })
      .subscribe(e => {
        const build = this.builds.findIndex(build => build.id === e.build_id);
        if (build === -1) {
          return;
        }

        const index = this.builds[build].jobs.findIndex(job => job.id === e.job_id);
        if (index !== -1) {
          switch (e.data) {
            case 'jobSucceded':
              this.builds[build].jobs[index].status = 'success';
              this.builds[build].jobs[index].end_time = new Date();
              break;
            case 'jobQueued':
              this.builds[build].jobs[index].status = 'queued';
              break;
            case 'jobStarted':
              this.builds[build].jobs[index].status = 'running';
              this.builds[build].jobs[index].start_time = new Date();
              this.builds[build].jobs[index].end_time = null;
              break;
            case 'jobFailed':
              this.builds[build].jobs[index].status = 'failed';
              this.builds[build].jobs[index].end_time = new Date();
              break;
            case 'jobStopped':
              this.builds[build].jobs[index].status = 'failed';
              this.builds[build].jobs[index].end_time = new Date();
              break;
          }

          this.update();
        }
      });
  }

  ngOnDestroy() {
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

      if (status !== 'running') {
        build.maxTime = Math.max(...build.jobs.map(job => job.end_time - job.start_time));
      } else {
        build.maxTime = Math.max(...build.jobs.map(job => job.start_time));
      }

      build.status = status;
      return build;
    });
  }

  fetch(e?: MouseEvent): void {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.fetching = true;
    this.apiService.getBuilds(this.limit, this.offset, this.userData.id).subscribe(builds => {
      this.builds = this.builds.concat(builds);
      this.loading = false;
      this.fetching = false;
      if (builds.length === this.limit) {
        this.offset += 5;
      } else {
        this.hideMoreButton = true;
      }

      this.update();
    });
  }

  fetchLastBuild(): void {
    this.apiService.getLastBuild(this.userData.id).subscribe(build => {
      if (!this.builds) {
        this.builds = [];
      }

      this.builds.unshift(build);
      this.update();
    });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }
}
