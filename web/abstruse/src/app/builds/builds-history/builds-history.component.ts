import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Build, generateBuildModel } from '../shared/build.model';
import { BuildService } from '../shared/build.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-builds-history',
  templateUrl: './builds-history.component.html',
  styleUrls: ['./builds-history.component.sass']
})
export class BuildsHistoryComponent implements OnInit, OnDestroy {
  repoid: number;
  fetching: boolean;
  builds: Build[];
  limit = 5;
  offset = 0;
  tab: 'all' | 'commits' | 'pr';
  sub: Subscription = new Subscription();

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.repoid = this.route.snapshot.params.repoid;
    this.tab = 'all';

    this.fetchBuilds();
    this.buildService.subscribeToBuildEvents();
    this.sub.add(
      this.buildService.buildEvents().subscribe((build: Build) => {
        this.builds.unshift(build);
        this.buildService.subscribeToJobEvents({ build_id: build.id });
        this.offset += 1;
      })
    );
    this.sub.add(
      this.buildService.jobEvents().subscribe((ev: SocketEvent) => {
        this.updateJobFromEvent(ev);
      })
    );
  }

  ngOnDestroy() {
    this.buildService.unsubscribeFromBuildEvents();
    this.sub.unsubscribe();
    if (this.builds && this.builds.length) {
      this.builds.forEach(build => this.buildService.unsubscribeFromJobEvents({ build_id: build.id }));
    }
  }

  fetchBuilds(): void {
    this.fetching = true;
    this.buildService.fetchBuildsByRepoID(this.repoid).subscribe((resp: JSONResponse) => {
      if (resp && resp.data && resp.data.length) {
        this.builds = resp.data.map(generateBuildModel);
        this.builds.forEach(build => this.buildService.subscribeToJobEvents({ build_id: build.id }));
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }

  updateJobFromEvent(ev: SocketEvent): void {
    if (!this.builds || !this.builds.length) {
      return;
    }

    const build = this.builds.find(b => b.id === ev.data.build_id);
    if (!build || !build.jobs || !build.jobs.length) {
      return;
    }

    const job = build.jobs.find(j => j.id === ev.data.job_id);
    if (!job) {
      return;
    }

    job.start_time = ev.data.start_time;
    job.end_time = ev.data.end_time;
    job.status = ev.data.status;
  }
}
