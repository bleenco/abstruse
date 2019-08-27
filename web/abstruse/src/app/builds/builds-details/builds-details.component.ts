import { Component, OnInit, OnDestroy } from '@angular/core';
import { BuildService } from '../shared/build.service';
import { ActivatedRoute } from '@angular/router';
import { Build, generateBuildModel } from '../shared/build.model';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Subscription } from 'rxjs';
import { SocketEvent } from 'src/app/shared/models/socket.model';

@Component({
  selector: 'app-builds-details',
  templateUrl: './builds-details.component.html',
  styleUrls: ['./builds-details.component.sass']
})
export class BuildsDetailsComponent implements OnInit, OnDestroy {
  buildid: number;
  fetching: boolean;
  build: Build;
  sub: Subscription;
  tab: 'jobs' | 'config';

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.buildid = this.route.snapshot.params.buildid;
    this.tab = 'jobs';
    this.fetchBuildInfo();

    this.sub = this.buildService.jobEvents().subscribe((ev: SocketEvent) => {
      this.updateJobFromEvent(ev);
    });
  }

  ngOnDestroy() {
    this.buildService.unsubscribeFromJobEvents({ build_id: this.buildid });
    this.sub.unsubscribe();
  }

  fetchBuildInfo(): void {
    this.fetching = true;
    this.buildService.fetchBuildInfo(this.buildid).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.build = generateBuildModel(resp.data);
        this.buildService.subscribeToJobEvents({ build_id: this.buildid });
      }
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

    this.build.jobs[jobIndex].start_time = ev.data.start_time;
    this.build.jobs[jobIndex].end_time = ev.data.end_time;
    this.build.jobs[jobIndex].status = ev.data.status;
  }
}
