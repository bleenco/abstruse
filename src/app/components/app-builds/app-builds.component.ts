import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs/Subscription';
import { format, distanceInWordsToNow } from 'date-fns';

@Component({
  selector: 'app-builds',
  templateUrl: 'app-builds.component.html'
})
export class AppBuildsComponent implements OnInit, OnDestroy {
  loading: boolean;
  sub: Subscription;
  builds: any[];
  show = 5;
  offset = 0;
  updateInterval: any;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.builds = [];
    this.loading = true;
  }

  ngOnInit() {
    this.fetch();

    this.sub = this.socketService.outputEvents
      .filter(x => x.type !== 'data')
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.data === 'jobAdded') {
          this.show = 5;
          this.offset = 0;
          this.fetch();
        }
      });

    this.socketService.outputEvents
      .filter(x => {
        x = x.data.toString() || '';
        return x.startsWith('job');
      })
      .subscribe(e => {
        const build = this.builds.findIndex(build => build.id === e.build_id);
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
        }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.stopUpdating();
  }

  update(): void {
    const currentTime = new Date().getTime() - this.socketService.timeSyncDiff;

    this.builds = this.builds.map(build => {
      console.log(build);

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

  startUpdating(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.update();
    this.updateInterval = setInterval(() => this.update, 1000);
  }

  stopUpdating(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  fetch(): void {
    this.loading = true;
    this.apiService.getBuilds(this.show, this.offset).subscribe(builds => {
      this.builds = builds;
      this.loading = false;
      this.offset = this.show;
      this.startUpdating();
    });
  }

  fetchAndConcat(): void {
    this.apiService.getBuilds(this.show, this.offset).subscribe(builds => {
      this.builds = this.builds.concat(builds);
      this.loading = false;
      this.startUpdating();
    });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }

  showPreviousBuilds(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.fetchAndConcat();
    this.show = this.show * 2;
    this.offset = this.show;
  }
}
