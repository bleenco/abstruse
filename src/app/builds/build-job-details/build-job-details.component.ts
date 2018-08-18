import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';
import { DataService } from '../../shared/providers/data.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-build-job-details',
  templateUrl: './build-job-details.component.html',
  styleUrls: ['./build-job-details.component.sass']
})
export class BuildJobDetailsComponent implements OnInit, OnDestroy {
  buildId: number;
  jobId: number;
  tab: 'log' | 'history';
  sub: Subscription;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService,
    public dataService: DataService
  ) { }

  ngOnInit() {
    this.tab = 'log';
    this.buildId = this.route.snapshot.params['id'];
    this.jobId = this.route.snapshot.params['jobid'];
    this.buildService.fetchJob(this.buildId, this.jobId);

    this.sub = this.dataService.socketOutput
      .pipe(
        filter(event => event.type === 'job restarted' && event.data === this.jobId)
      )
      .subscribe(() => this.buildService.fetchJob(this.buildId, this.jobId, false));
  }

  ngOnDestroy() {
    this.buildService.unsubscribeFromJobDetails();

    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  viewLog(index: number): void {
    this.buildService.terminalInput = { clear: true };
    const log = this.buildService.job.runs[index].log;
    setTimeout(() => {
      this.tab = 'log';
      this.buildService.terminalInput = log;
    });
  }

  restartJob(ev: MouseEvent): void {
    this.buildService.restartJob(ev, this.jobId);
    this.tab = 'log';
  }
}
