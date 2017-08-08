import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { format, distanceInWordsToNow } from 'date-fns';
import { Subscription } from 'rxjs/Subscription';

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

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.builds = [];
    this.loading = true;
  }

  ngOnInit() {
    this.fetch();
    this.offset = this.show;

    this.sub = this.socketService.outputEvents
      .filter(x => x.type !== 'data')
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.type === 'buildRestarted' || event.type === 'buildStopped') {
          const buildIndex = this.builds.findIndex(build => build.id === event.data);
          this.builds[buildIndex].processingRequest = false;
        }

        if (event.data === 'jobAdded') {
          this.fetch();
        }

        const index = this.builds.findIndex(build => build.id === event.build_id);
        if (index !== -1) {
          const jobIndex = this.builds[index].jobs.findIndex(job => job.id === event.job_id);
          if (jobIndex !== -1) {
            let status = null;
            switch (event.data) {
              case 'jobSucceded':
                status = 'success';
              break;
              case 'jobQueued':
                status = 'queued';
              break;
              case 'jobStarted':
                status = 'running';
                this.builds[index].jobs[jobIndex].start_time = new Date();
              break;
              case 'jobFailed':
                status = 'failed';
                this.builds[index].jobs[jobIndex].end_time = new Date();
              break;
              case 'jobStopped':
                status = 'failed';
                this.builds[index].jobs[jobIndex].end_time = new Date();
              break;
            }

            this.builds[index].jobs[jobIndex].status = status;
          }
        }
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  fetch(): void {
    this.apiService.getBuilds(this.show, this.offset).subscribe(builds => {
      this.builds = this.builds.concat(builds);
      this.updateJobs();
      setInterval(() => this.updateJobs(), 1000);
      this.loading = false;
    });
  }

  updateJobs(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;

    this.builds = this.builds
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

  restartBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();
    const buildIndex = this.builds.findIndex(build => build.id === id);
    this.builds[buildIndex].processingRequest = true;
    this.socketService.emit({ type: 'restartBuild', data: { buildId: id } });
  }

  stopBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();
    const buildIndex = this.builds.findIndex(build => build.id === id);
    this.builds[buildIndex].processingRequest = true;
    this.socketService.emit({ type: 'stopBuild', data: { buildId: id } });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }

  showPreviousBuilds(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.fetch();
    this.show = this.show * 2;
    this.offset = this.show;
  }
}
