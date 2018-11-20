import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';
import { Build, BuildStatus } from '../shared/build.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataService } from 'src/app/shared/providers/data.service';
import { TimeService } from 'src/app/shared/providers/time.service';
import { distanceInWordsToNow } from 'date-fns';

@Component({
  selector: 'app-build-details',
  templateUrl: './build-details.component.html',
  styleUrls: ['./build-details.component.sass']
})
export class BuildDetailsComponent implements OnInit, OnDestroy {
  buildId: number;
  build: Build;
  fetchingBuild: boolean;
  statusSub: Subscription;
  sub: Subscription;
  buildSub: Subscription;
  timerSubscription: Subscription;
  maxCompletedJobTime: number;
  minRunningJobStartTime: number;
  currentTime: number;
  dateTimeToNow: string;

  constructor(
    public buildService: BuildService,
    public dataService: DataService,
    public timeService: TimeService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.build = null;
    this.buildId = this.route.snapshot.params.id;
    this.fetchBuild();
  }

  ngOnDestroy() {
    this.unsubscribeFromBuildDetails();
  }

  private fetchBuild(): void {
    this.fetchingBuild = true;
    this.buildService.fetchBuild(this.buildId)
      .subscribe((build: Build) => {
        this.build = build;
        this.fetchingBuild = false;
        const times = this.buildService.updateJobTimes(this.build);
        this.build = times.build;
        this.maxCompletedJobTime = times.maxCompletedJobTime;
        this.minRunningJobStartTime = times.minRunningJobStartTime || this.minRunningJobStartTime;
        this.subscribeToBuildDetails();
      });
  }

  restartBuild(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.build) {
      return;
    }

    this.build.processing = true;
    this.dataService.socketInput.emit({ type: 'restartBuild', data: { buildId: this.buildId } });
  }

  stopBuild(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.build) {
      return;
    }

    this.build.processing = true;
    this.dataService.socketInput.emit({ type: 'stopBuild', data: { buildId: this.buildId } });
  }

  private subscribeToBuildDetails(): void {
    this.statusSub = this.dataService.socketOutput
      .pipe(filter(event => event.type === 'process' && this.build.jobs.findIndex(job => job.id === event.job_id) !== -1))
      .subscribe(event => {
        const job = this.build.jobs.find(j => j.id === event.job_id);
        switch (event.data) {
          case 'job started':
            job.status = BuildStatus.running;
            job.end_time = null;
            job.start_time = event.additionalData;
            job.runs.push({ start_time: event.additionalData, end_time: null });
            break;
          case 'job succeded':
            job.status = BuildStatus.passed;
            job.end_time = event.additionalData;
            job.runs[job.runs.length - 1].end_time = event.additionalData;
            break;
          case 'job failed':
            job.status = BuildStatus.failed;
            if (job.end_time) {
              job.end_time = event.additionalData;
            }
            if (job.runs[job.runs.length - 1].end_time) {
              job.runs[job.runs.length - 1].end_time = event.additionalData;
            }
            break;
          case 'job stopped':
            if (job.status !== BuildStatus.passed) {
              job.status = BuildStatus.failed;
            }
            if (job.end_time) {
              job.end_time = event.additionalData;
            }
            if (job.runs[job.runs.length - 1].end_time) {
              job.runs[job.runs.length - 1].end_time = event.additionalData;
            }
            break;
          case 'job queued':
            job.status = BuildStatus.queued;
            break;
        }

        job.processing = false;
        this.build.status = this.buildService.getBuildStatus(this.build);
        const times = this.buildService.updateJobTimes(this.build);
        this.build = times.build;
        this.maxCompletedJobTime = times.maxCompletedJobTime;
        this.minRunningJobStartTime = times.minRunningJobStartTime || this.minRunningJobStartTime;
      });

    this.sub = this.dataService.socketOutput
      .pipe(filter(e => e.type === 'build stopped' || e.type === 'build restarted'))
      .subscribe(() => this.build.processing = false);

    this.buildSub = this.dataService.socketOutput
      .pipe(filter(e => e.data === 'build restarted' || e.data === 'build succeded' || e.data === 'build failed'))
      .subscribe(e => {
        if (e.build_id === Number(this.build.id)) {
          if (e.data === 'build restarted') {
            this.build.start_time = e.additionalData;
            this.build.processing = false;
          } else {
            this.build.end_time = e.additionalData;
          }
        }
      });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.dateTimeToNow = distanceInWordsToNow(this.build.dateTime);
    });
  }

  private unsubscribeFromBuildDetails(): void {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.buildSub) {
      this.buildSub.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
