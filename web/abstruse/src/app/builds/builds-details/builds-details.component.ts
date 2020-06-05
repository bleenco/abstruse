import { Component, OnInit, OnDestroy } from '@angular/core';
import { Build } from '../shared/build.model';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { DataService } from 'src/app/shared/providers/data.service';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-builds-details',
  templateUrl: './builds-details.component.html',
  styleUrls: ['./builds-details.component.sass']
})
export class BuildsDetailsComponent implements OnInit, OnDestroy {
  buildid: number;
  fetching: boolean;
  build: Build;
  sub: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private buildsService: BuildsService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.buildid = Number(this.activatedRoute.snapshot.paramMap.get('buildid'));
    this.findAll();
    this.sub.add(this.buildsService.jobEvents().subscribe((ev: SocketEvent) => this.updateJobFromEvent(ev)));
    this.buildsService.subscribeToJobEvents([this.buildid]);
  }

  ngOnDestroy(): void {
    this.dataService.unsubscribeAll();
  }

  findAll(): void {
    this.fetching = true;
    this.buildsService.findAll(this.buildid)
      .subscribe(build => {
        this.build = build;
      }, err => {
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }

  updateJobFromEvent(ev: SocketEvent): void {
    if (!this.build || this.build.id !== ev.data.build_id) {
      return;
    }

    const jobIndex = this.build.jobs.findIndex(job => job.id === ev.data.job_id);
    if (jobIndex < 0) {
      return;
    }

    this.build.jobs[jobIndex].startTime = ev.data.start_time ? new Date(ev.data.start_time) : null;
    this.build.jobs[jobIndex].endTime = ev.data.end_time ? new Date(ev.data.end_time) : null;
    this.build.jobs[jobIndex].status = ev.data.status;
  }
}
