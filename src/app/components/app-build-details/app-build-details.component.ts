import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/filter';
import { distanceInWordsToNow, format } from 'date-fns';

@Component({
  selector: 'app-build-details',
  templateUrl: 'app-build-details.component.html'
})
export class AppBuildDetailsComponent implements OnInit {
  id: string;
  build: any;
  status: string;
  timeWords: string;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.status = 'queued';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params.id;

      this.apiService.getBuild(this.id).subscribe(build => {
        this.build = build;
        this.build.jobs.forEach(job => {
          job.time = '00:00';
        });
        this.timeWords = distanceInWordsToNow(this.build.commit_date);

        this.status = this.getBuildStatus();

        this.socketService.outputEvents
        .filter(event => event.type === 'process')
        .subscribe(event => {
          let index = this.build.jobs.findIndex(job => job.id === event.job_id);
          if (index !== -1) {
            this.ngZone.run(() => {
              if (event.data === 'jobStarted') {
                this.build.jobs[index].status = 'running';
                this.build.jobs.end_time = null;
              } else if (event.data === 'jobSucceded') {
                this.build.jobs[index].status = 'success';
                this.build.jobs.end_time = new Date().getTime();
              } else if (event.data == 'jobFailed') {
                this.build.jobs[index].status = 'failed';
                this.build.jobs.end_time = new Date().getTime();
              }

              this.status = this.getBuildStatus();
            });
          }
        });
      });
    });
  }

  getBuildStatus(): string {
    let status = '';

    if (this.build.jobs.findIndex(job => job.status === 'failed') !== -1) {
      status = 'failed';
    }

    if (this.build.jobs.findIndex(job => job.status === 'success') !== -1) {
      status = 'success';
    }

    if (this.build.jobs.findIndex(job => job.status === 'running') !== -1) {
      status = 'running';
    }

    return status === '' ? 'queued' : status;
  }

  runBuild(repositoryId: number): void {
    // this.apiService.runBuild(repositoryId).subscribe(event => {
    //   // build runned.
    // });
  }

  restartBuild(buildId: string): void {
    this.socketService.emit({ type: 'restartBuild', data: buildId });
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

  stopBuild(): void {
    this.socketService.emit({ type: 'stopBuild', data: this.id });
  }
}
