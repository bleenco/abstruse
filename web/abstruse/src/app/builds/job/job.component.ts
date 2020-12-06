import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { Job } from '../shared/build.model';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { DataService } from 'src/app/shared/providers/data.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.sass']
})
export class JobComponent implements OnInit, OnDestroy {
  jobID!: number;
  buildID!: number;
  job!: Job;
  fetching = false;
  processing = false;
  sub: Subscription = new Subscription();

  constructor(private route: ActivatedRoute, private buildsService: BuildsService, private dataService: DataService) {}

  ngOnInit(): void {
    this.jobID = Number(this.route.snapshot.paramMap.get('jobid'));
    this.buildID = Number(this.route.snapshot.paramMap.get('buildid'));
    this.findJob();
    this.sub.add(this.buildsService.jobEvents().subscribe((ev: SocketEvent) => this.updateJobFromEvent(ev)));
    this.sub.add(this.buildsService.jobLogEvents().subscribe((ev: SocketEvent) => this.updateJobLogFromEvent(ev)));
    this.buildsService.subscribeToJobEvents();
    this.buildsService.subscribeToJobLogEvents(this.jobID);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.dataService.unsubscribeAll();
  }

  findJob(): void {
    this.fetching = true;
    this.buildsService
      .findJob(this.jobID)
      .pipe(
        finalize(() => (this.fetching = false)),
        untilDestroyed(this)
      )
      .subscribe(resp => {
        this.job = resp;
      });
  }

  restartJob(): void {
    this.job.log = '__CLEAR__';
    this.job.processing = true;
    this.buildsService
      .restartJob(this.job.id)
      .pipe(
        finalize(() => (this.job.processing = false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  stopJob(): void {
    this.job.processing = true;
    this.buildsService
      .stopJob(this.job.id)
      .pipe(
        finalize(() => (this.job.processing = false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private updateJobFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data || ev.data.jobID !== this.jobID) {
      return;
    }

    if (ev.data.startTime) {
      this.job.startTime = ev.data.startTime;
    }
    if (ev.data.endTime) {
      this.job.endTime = ev.data.endTime;
    }
    if (ev.data.status) {
      this.job.status = ev.data.status;
    }
  }

  private updateJobLogFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data || ev.data.id !== this.jobID) {
      return;
    }

    this.job.log = ev.data.log;
  }
}
