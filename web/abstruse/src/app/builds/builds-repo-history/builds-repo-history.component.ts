import { Component, OnInit, OnDestroy } from '@angular/core';
import { Repo } from 'src/app/repos/shared/repo.model';
import { Build } from '../shared/build.model';
import { ActivatedRoute } from '@angular/router';
import { ReposService } from 'src/app/repos/shared/repos.service';
import { BuildsService } from '../shared/builds.service';
import { DataService } from 'src/app/shared/providers/data.service';
import { Subscription } from 'rxjs';
import { SocketEvent } from 'src/app/shared/models/socket.model';

@Component({
  selector: 'app-builds-repo-history',
  templateUrl: './builds-repo-history.component.html',
  styleUrls: ['./builds-repo-history.component.sass']
})
export class BuildsRepoHistoryComponent implements OnInit, OnDestroy {
  repoid: number;
  fetchingBuilds: boolean;
  fetchingMore: boolean;
  hideMoreButton: boolean;
  builds: Build[] = [];
  limit = 5;
  offset = 0;
  sub: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private buildsService: BuildsService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.repoid = Number(this.activatedRoute.snapshot.paramMap.get('repoid'));
    this.findBuilds();
    this.initDataEvents();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.dataService.unsubscribeAll();
  }

  findBuilds(): void {
    if (this.offset === 0) {
      this.fetchingBuilds = true;
    } else {
      this.fetchingMore = true;
    }

    this.buildsService.findByRepoID(this.repoid, this.limit, this.offset)
      .subscribe((resp: Build[]) => {
        this.builds = this.builds.concat(resp);
        if (resp.length === this.limit) {
          this.offset += resp.length;
        } else {
          this.hideMoreButton = true;
        }
        this.buildsService.subscribeToJobEvents(resp.reduce((acc, curr) => acc.concat(curr.jobs.map(j => j.id)), []));
      }, err => {
        console.error(err);
      }, () => {
        this.fetchingBuilds = false;
        this.fetchingMore = false;
      });
  }

  private initDataEvents(): void {
    this.buildsService.subscribeToBuildsEvents();
    this.sub
      .add(
        this.buildsService.buildsEvents(this.repoid)
          .subscribe(build => {
            this.builds.unshift(build);
            this.buildsService.subscribeToJobEvents(build.jobs.map(j => j.id));
          })
      )
      .add(this.buildsService.jobEvents().subscribe(ev => this.updateJobFromEvent(ev)));
  }

  private updateJobFromEvent(ev: SocketEvent): void {
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

    job.startTime = ev.data.start_time ? new Date(ev.data.start_time) : null;
    job.endTime = ev.data.end_time ? new Date(ev.data.end_time) : null;
    job.status = ev.data.status;
  }
}
