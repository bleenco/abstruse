import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { Job } from '../shared/build.model';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { DataService } from 'src/app/shared/providers/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-builds-job-details',
  templateUrl: './builds-job-details.component.html',
  styleUrls: ['./builds-job-details.component.sass']
})
export class BuildsJobDetailsComponent implements OnInit, OnDestroy {
  buildid: number;
  jobid: number;
  fetching: boolean;
  job: Job;
  sub: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private buildsService: BuildsService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildid = Number(this.activatedRoute.snapshot.paramMap.get('buildid'));
    this.jobid = Number(this.activatedRoute.snapshot.paramMap.get('jobid'));
    this.findJob();
    this.sub.add(this.buildsService.jobEvents().subscribe((ev: SocketEvent) => this.updateJobFromEvent(ev)));
    this.sub.add(this.buildsService.jobLogEvents().subscribe((ev: SocketEvent) => this.updateJobLogFromEvent(ev)));
    this.buildsService.subscribeToJobEvents([this.buildid]);
    this.buildsService.subscribeToJobLogEvents(this.jobid);
  }

  ngOnDestroy(): void {
    this.dataService.unsubscribeAll();
  }

  findJob(): void {
    this.fetching = true;
    this.buildsService.findJob(this.jobid)
      .subscribe(job => {
        this.job = job;
      }, err => {
        this.fetching = false;
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }

  private updateJobFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data || ev.data.job_id !== this.jobid) {
      return;
    }

    if (ev.data.startTime) {
      this.job.startTime = ev.data.start_time;
    }
    if (ev.data.endTime) {
      this.job.endTime = ev.data.end_time;
    }
    if (ev.data.status) {
      this.job.status = ev.data.status;
    }
  }

  private updateJobLogFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data || ev.data.id !== this.jobid) {
      return;
    }

    this.job.log = ev.data.log;
  }
}
