import { Component, OnInit, OnDestroy, NgZone, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
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
  jobRun: any;
  terminalReady: boolean;
  terminalOptions:  { size: 'small' | 'large' };
  terminalInput: any;
  timeWords: string;
  previousRuntime: number;
  processing: boolean;
  sshd: string;
  vnc: string;
  expectedProgress: number;
  tag: string = null;
  userData: any;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: any,
    private titleService: Title
  ) {
    this.loading = true;
    this.terminalOptions = { size: 'large' };
    this.id = null;
    this.expectedProgress = 0;
  }

  ngOnInit() {
    this.userData = this.authService.getData();
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
        if (!this.jobRun) {
          return;
        }

        if (event.data === 'jobStarted') {
          this.jobRun.status = 'running';
          this.jobRun.end_time = null;
          this.jobRun.start_time = new Date().getTime();
        } else if (event.data === 'jobSucceded') {
          this.jobRun.status = 'success';
          this.jobRun.end_time = new Date().getTime();
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        } else if (event.data == 'jobFailed') {
          this.jobRun.status = 'failed';
          this.jobRun.end_time = new Date().getTime();
        }

        this.setFavicon();
      });

    this.route.params.subscribe(params => {
      this.id = params.id;

      this.apiService.getJob(this.id, this.userData.id).subscribe(job => {
        this.job = job;

        if (this.job.build.data.ref && this.job.build.data.ref.startsWith('refs/tags/')) {
          this.tag = this.job.build.data.ref.replace('refs/tags/', '');
        }

        this.jobRun = job.runs[job.runs.length - 1];
        this.terminalInput = this.jobRun.log;
        this.timeWords = distanceInWordsToNow(job.build.start_time);
        this.setFavicon();
        this.loading = false;
        if (this.job.lastJob && this.job.lastJob.end_time) {
          this.previousRuntime = this.job.lastJob.end_time - this.job.lastJob.start_time;
        }

        this.socketService.emit({ type: 'subscribeToJobOutput', data: { jobId: this.id } });

        this.updateJobTime();
        setInterval(() => this.updateJobTime(), 1000);
      });
    });
  }

  ngOnDestroy() {
    if (this.termSub) {
      this.termSub.unsubscribe();
    }

    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.document.getElementById('favicon').setAttribute('href', 'images/favicon.png');
    this.titleService.setTitle('Abstruse CI');
  }

  updateJobTime(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;
    if (!this.jobRun.end_time || this.jobRun.status === 'running') {
      this.job.time = format(currentTime - this.jobRun.start_time, 'mm:ss');
    } else {
      this.job.time = format(this.jobRun.end_time - this.jobRun.start_time, 'mm:ss');
    }
    if (this.previousRuntime) {
      this.expectedProgress = (currentTime - this.jobRun.start_time) / this.previousRuntime;
    }
  }

  setFavicon(): void {
    let favicon;
    switch (this.jobRun.status) {
      case 'queued': favicon = 'images/favicon-queued.png'; break;
      case 'failed': favicon = 'images/favicon-error.png'; break;
      case 'running': favicon = 'images/favicon-running.png'; break;
      case 'success': favicon = 'images/favicon.png'; break;
      default: favicon = 'images/favicon.png'; break;
    }

    const name = this.job.build.repository.full_name;
    const status = this.jobRun.status;
    this.titleService.setTitle(`${name} - ${status}`);
    this.document.getElementById('favicon').setAttribute('href', favicon);
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
