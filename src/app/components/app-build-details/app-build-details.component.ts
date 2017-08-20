import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { distanceInWordsToNow, distanceInWordsStrict, format } from 'date-fns';

@Component({
  selector: 'app-build-details',
  templateUrl: 'app-build-details.component.html'
})
export class AppBuildDetailsComponent implements OnInit {
  loading: boolean;
  id: string;
  build: any;
  status: string;
  timeWords: string;
  totalTime: string;
  previousRuntime: number;
  processingBuild: boolean;
  approximatelyRemainingTime: string;
  tag: string = null;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.loading = true;
    this.status = 'queued';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params.id;

      this.apiService.getBuild(this.id).subscribe(build => {
        this.loading = false;
        this.build = build;

        if (this.build.data.ref.startsWith('refs/tags/')) {
          this.tag = this.build.data.ref.replace('refs/tags/', '');
        }

        this.build.jobs.forEach(job => job.time = '00:00');
        this.timeWords = distanceInWordsToNow(this.build.start_time);
        if (this.build.lastBuild) {
          this.previousRuntime = this.build.lastBuild.end_time - this.build.lastBuild.start_time;
        }

        this.status = this.getBuildStatus();

        this.updateJobTimes();
        setInterval(() => this.updateJobTimes(), 1000);

        this.socketService.outputEvents
          .filter(event => event.type === 'process')
          .subscribe(event => {
            let index = this.build.jobs.findIndex(job => job.id === event.job_id);
            if (index !== -1) {
              if (event.data === 'jobStarted') {
                this.build.jobs[index].status = 'running';
                this.build.jobs[index].end_time = null;
                this.build.jobs[index].start_time = new Date().getTime();
              } else if (event.data === 'jobSucceded') {
                this.build.jobs[index].status = 'success';
                this.build.jobs[index].end_time = new Date().getTime();
              } else if (event.data === 'jobFailed' || event.data === 'jobStopped') {
                this.build.jobs[index].status = 'failed';
                this.build.jobs[index].end_time = new Date().getTime();
              } else if (event.data === 'jobQueued') {
                this.build.jobs[index].status = 'queued';
              }

              this.status = this.getBuildStatus();
            }
          });

        this.socketService.outputEvents
          .filter(event => event.type === 'buildRestarted' || event.type === 'buildStopped')
          .subscribe(event => {
            this.processingBuild = false;
          });
      });
    });
  }

  updateJobTimes(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;
    this.build.jobs = this.build.jobs.map(job => {
      if (job.status === 'queued') {
        job.time = '00:00';
      } else if (!job.end_time || job.status === 'running') {
        job.time = format(currentTime - job.start_time, 'mm:ss');
      } else {
        job.time = format(job.end_time - job.start_time, 'mm:ss');
      }

      return job;
    });

    let runningTime = Math.max(...this.build.jobs.map(job => {
      let date = new Date(0);
      let splitted = job.time.split(':');
      date.setUTCMinutes(splitted[0]);
      date.setUTCSeconds(splitted[1]);
      return date;
    }));
    this.totalTime = format(runningTime, 'mm:ss');

    if (this.previousRuntime && this.previousRuntime > runningTime) {
      this.approximatelyRemainingTime = format(this.previousRuntime - runningTime, 'mm:ss');
    }
  }

  getBuildStatus(): string {
    let status = 'queued';

    if (this.build.jobs.findIndex(job => job.status === 'failed') !== -1) {
      status = 'failed';
    }

    if (this.build.jobs.findIndex(job => job.status === 'running') !== -1) {
      status = 'running';
    }

    if (this.build.jobs.length === this.build.jobs.filter(job => job.status === 'success').length) {
      status = 'success';
    }

    return status;
  }

  restartJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.socketService.emit({ type: 'restartJob', data: { jobId: jobId } });
  }

  stopJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.socketService.emit({ type: 'stopJob', data: { jobId: jobId } });
  }

  restartBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.getBuildStatus() === 'success') {
      let minJobStartTime = Math.min(...this.build.jobs.map(job => job.start_time));
      let maxJobEndTime = Math.max(...this.build.jobs.map(job => job.end_time));
      this.previousRuntime = maxJobEndTime - minJobStartTime;
    }
    this.processingBuild = true;
    this.socketService.emit({ type: 'restartBuild', data: { buildId: id } });
  }

  stopBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.processingBuild = true;
    this.socketService.emit({ type: 'stopBuild', data: { buildId: id } });
  }

  gotoJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.router.navigate(['job', jobId]);
  }
}
