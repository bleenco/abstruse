import { Component, OnInit, OnDestroy } from '@angular/core';
import { BuildService } from '../shared/build.service';
import { ActivatedRoute } from '@angular/router';
import { Build, generateBuildModel } from '../shared/build.model';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Subscription } from 'rxjs';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { isValid } from 'date-fns';

@Component({
  selector: 'app-builds-details',
  templateUrl: './builds-details.component.html',
  styleUrls: ['./builds-details.component.sass']
})
export class BuildsDetailsComponent implements OnInit, OnDestroy {
  id: number;
  fetching: boolean;
  build: Build;
  sub: Subscription;
  tab: 'jobs' | 'config';

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.tab = 'jobs';
    this.fetchBuildInfo();

    this.buildService.subscribeToBuildEvents();

    this.sub = this.buildService.socketEvents().subscribe((ev: SocketEvent) => {
      this.updateBuildFromEvent(ev);
    });
  }

  ngOnDestroy() {
    this.buildService.unsubscribeFromBuildEvents();
    this.sub.unsubscribe();
  }

  fetchBuildInfo(): void {
    this.fetching = true;
    this.buildService.fetchBuildInfo(this.id).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.build = generateBuildModel(resp.data);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }

  updateBuildFromEvent(ev: SocketEvent): void {
    if (!this.build || this.build.id !== ev.data.build_id) {
      return;
    }

    const jobIndex = this.build.jobs.findIndex(job => job.id === ev.data.job_id);
    if (jobIndex < 0) {
      return;
    }

    this.build.jobs[jobIndex].start_time = isValid(ev.data.start_time) ? ev.data.start_time : null;
    this.build.jobs[jobIndex].end_time = isValid(ev.data.end_time) ? ev.data.end_time : null;
    this.build.jobs[jobIndex].status = ev.data.status;
  }
}
