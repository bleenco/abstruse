import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';
import { format, distanceInWordsToNow, distanceInWordsStrict } from 'date-fns';

@Component({
  selector: 'app-job',
  templateUrl: 'app-job.component.html'
})
export class AppJobComponent implements OnInit, OnDestroy {
  loading: boolean;
  termSub: Subscription;
  sub: Subscription;
  id: number;
  job: any;
  status: string;
  terminalReady: boolean;
  terminalOptions:  { size: 'small' | 'large' };
  terminalInput: any;
  timeWords: string;
  previousRuntime: number;
  processing: boolean;
  sshd: string;
  vnc: string;
  expectedProgress: number;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.loading = true;
    this.status = 'queued';
    this.terminalOptions = { size: 'large' };
    this.id = null;
    this.expectedProgress = 0;
  }

  ngOnInit() {
    this.termSub = this.socketService.outputEvents
      .subscribe(event => {
        if (event.type === 'data') {
          this.ngZone.run(() => this.terminalInput = event.data);
        } else if (event.type === 'jobStopped' && event.data === this.id) {
          this.processing = false;
        } else if (event.type === 'jobRestarted' && event.data === this.id) {
          this.processing = false;
        } else if (event.type === 'exposedPort') {
          if (parseInt(event.data.split(':')[0], 10) === 22) {
            this.sshd = `${document.location.hostname}:${event.data.split(':')[1]}`;
          } else if (parseInt(event.data.split(':')[0], 10) === 5900) {
            this.vnc = `${document.location.hostname}:${event.data.split(':')[1]}`;
          }
        }
      });

    this.sub = this.socketService.outputEvents
      .filter(event => event.type === 'process')
      .filter(event => event.job_id === parseInt(<any>this.id, 10))
      .subscribe(event => {
        if (!this.job) {
          return;
        }

        if (event.data === 'jobStarted') {
          this.job.status = 'running';
          this.job.end_time = null;
          this.job.start_time = new Date().getTime();
        } else if (event.data === 'jobSucceded') {
          this.job.status = 'success';
          this.job.end_time = new Date().getTime();
        } else if (event.data == 'jobFailed') {
          this.job.status = 'failed';
          this.job.end_time = new Date().getTime();
        }
      });

    this.route.params.subscribe(params => {
      this.id = params.id;

      this.apiService.getJob(this.id).subscribe(job => {
        this.job = job;
        this.terminalInput = job.log;
        this.timeWords = distanceInWordsToNow(job.build.start_time);
        this.loading = false;
        if (this.job.lastJob) {
          this.previousRuntime = this.job.lastJob.end_time - this.job.lastJob.start_time;
        }

        this.socketService.emit({ type: 'subscribeToJobOutput', data: { jobId: this.id } });

        this.updateJobTime();
        setInterval(() => this.updateJobTime(), 1000);
      });
    });
  }

  ngOnDestroy() {
    this.termSub.unsubscribe();
    this.sub.unsubscribe();
  }

  updateJobTime(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;
    if (!this.job.end_time || this.job.status === 'running') {
      this.job.time = format(currentTime - this.job.start_time, 'mm:ss');
    } else {
      this.job.time = format(this.job.end_time - this.job.start_time, 'mm:ss');
    }
    if (this.previousRuntime) {
      this.expectedProgress = (currentTime - this.job.start_time) / this.previousRuntime;
    }
  }

  restartJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.terminalInput = { clear: true };
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.socketService.emit({ type: 'restartJob', data: { jobId: this.id } });
  }

  restartJobWithSSH(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.terminalInput = { clear: true };
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.socketService.emit({ type: 'restartJobWithSshAndVnc', data: { jobId: this.id } });
  }

  stopJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.socketService.emit({ type: 'stopJob', data: { jobId: this.id } });
  }

  terminalOutput(e: any): void {
    if (e === 'ready') {
      this.terminalReady = true;
    }
  }
}
