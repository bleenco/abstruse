import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';
import { DataService } from '../../shared/providers/data.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Build, BuildJob } from '../shared/build.model';
import { distanceInWordsToNow } from 'date-fns';
import { TimeService } from 'src/app/shared/providers/time.service';

@Component({
  selector: 'app-build-job-details',
  templateUrl: './build-job-details.component.html',
  styleUrls: ['./build-job-details.component.sass']
})
export class BuildJobDetailsComponent implements OnInit, OnDestroy {
  buildId: number;
  jobId: number;
  tab: 'log' | 'history';
  fetching: boolean;
  build: Build;
  job: BuildJob;
  jobRun: any;
  terminalInput: any;
  timeWords: string;
  previousRuntime: number;
  currentTime: number;
  termSub: Subscription;
  jobSub: Subscription;
  timerSubscription: Subscription;
  restartSub: Subscription;
  sshd: string;
  vnc: string;
  debug: boolean;
  dateTimeToNow: string;
  dateTime: string;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService,
    public dataService: DataService,
    public timeService: TimeService
  ) { }

  ngOnInit() {
    this.buildId = this.route.snapshot.params['id'];
    this.jobId = this.route.snapshot.params['jobid'];
    this.tab = 'log';
    this.terminalInput = '';
    this.build = null;
    this.job = null;
    this.jobRun = null;
    this.timeWords = '';
    this.previousRuntime = null;
    this.currentTime = new Date().getTime();
    this.sshd = null;
    this.vnc = null;
    this.debug = false;
    this.dateTimeToNow = null;

    this.fetch();
    this.restartSub = this.dataService.socketOutput
      .pipe(
        filter(event => event.type === 'job restarted' && event.data === this.jobId)
      )
      .subscribe(() => this.fetch(false));
  }

  ngOnDestroy() {
    this.unsubscribeFromJobDetails();
  }

  restartJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.tab = 'log';
    this.job.processing = true;
    this.dataService.socketInput.emit({ type: 'restartJob', data: { jobId: this.jobId } });
  }

  stopJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.job.processing = true;
    this.dataService.socketInput.emit({ type: 'stopJob', data: { jobId: this.jobId } });
  }

  private fetch(loading: boolean = true): void {
    if (loading) {
      this.fetching = true;
    }

    this.buildService.fetchJob(this.buildId, this.jobId)
      .subscribe(job => {
        this.build = job.build;
        this.job = job;

        this.job.runs = this.job.runs.map(run => {
          if (run.start_time) {
            run.start_time = new Date(run.start_time).getTime();
          }
          if (run.end_time) {
            run.end_time = new Date(run.end_time).getTime();
          }
          return run;
        });

        this.jobRun = this.job.runs[this.job.runs.length - 1];
        this.terminalInput = this.jobRun.log;
        this.timeWords = distanceInWordsToNow(this.build.created_at);

        const lastRun = job.runs && job.runs[job.runs.length - 1].end_time ? job.runs[job.runs.length - 1] : job.runs[job.runs.length - 2];
        if (lastRun) {
          this.previousRuntime = new Date(lastRun.end_time).getTime() - new Date(lastRun.start_time).getTime();
        }

        if (loading) {
          this.fetching = false;
          this.subscribeToJobDetails();
        }
      });
  }

  private subscribeToJobDetails(): void {
    this.termSub = this.dataService.socketOutput
      .subscribe(event => {
        if (event.type === 'data' || event.type === 'exit' || event.type === 'container' || event.type === 'jobLog') {
          if (Number(event.job_id) === Number(this.jobId) || event.type === 'jobLog') {
            if (event.data.toString().includes('starting container')) {
              setTimeout(() => this.terminalInput = { clear: true });
              if (event.data.toString().includes('executed command')) {
                const splitted = event.data.toString().split('==>');
                event.data = '==>' + splitted[1];
              }
            }
            setTimeout(() => this.terminalInput = event.data);
          }
        } else if (event.type === 'job stopped' && event.data === this.jobId) {
          this.job.processing = false;
        } else if (event.type === 'job restarted' && event.data === this.jobId) {
          this.job.processing = false;
        } else if (event.type === 'exposed ports') {
          const portData = event.data && event.data.info || null;

          if (portData && portData['22/tcp']) {
            const port = portData['22/tcp'][0].HostPort;
            this.sshd = `${document.location.hostname}:${port}`;
          }

          if (portData && portData['5900/tcp']) {
            const port = portData['5900/tcp'][0].HostPort;
            this.vnc = `${document.location.hostname}:${port}`;
          }
        } else if (event.type === 'debug') {
          const debug = event.data || 'false';
          this.debug = debug === 'true';
        }
      });

    this.dataService.socketInput.emit({ type: 'subscribeToJobOutput', data: { jobId: this.jobId } });

    this.jobSub = this.dataService.socketOutput
      .pipe(
        filter(event => event.type === 'process'),
        filter((event: any) => Number(event.job_id) === Number(this.jobId))
      )
      .subscribe(event => {
        if (!this.jobRun) {
          return;
        }

        if (event.data === 'job started') {
          this.jobRun.status = 'running';
          this.jobRun.end_time = null;
          this.jobRun.start_time = new Date(event.additionalData).getTime();
        } else if (event.data === 'job succeded') {
          this.jobRun.status = 'success';
          this.jobRun.end_time = new Date(event.additionalData).getTime();
          this.previousRuntime = new Date(this.jobRun.end_time).getTime() - new Date(this.jobRun.start_time).getTime();
        } else if (event.data === 'job failed') {
          this.jobRun.status = 'failed';
          this.jobRun.end_time = new Date(event.additionalData).getTime();
          this.previousRuntime = new Date(this.jobRun.end_time).getTime() - new Date(this.jobRun.start_time).getTime();
        }

        this.buildService.setFavicon(this.build.repository_name, this.jobRun.status);
      });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.dateTimeToNow = distanceInWordsToNow(this.dateTime);
    });
  }

  private unsubscribeFromJobDetails(): void {
    this.dataService.socketInput.emit({ type: 'unsubscribeFromJobOutput' });

    if (this.termSub) {
      this.termSub.unsubscribe();
    }
    if (this.jobSub) {
      this.jobSub.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  viewLog(index: number): void {
    this.tab = 'log';
    this.terminalInput = { clear: true };
    setTimeout(() => this.terminalInput = this.job.runs[index].log);
  }
}
