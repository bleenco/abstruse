import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { Build } from '../../shared/build.model';
import { BuildsService, BuildsFindParams } from '../../shared/builds.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SocketEvent } from '../../../shared/models/socket.model';
import { DataService } from '../../../shared/providers/data.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { BuildsItemsOptions } from './builds-items-options.model';

@UntilDestroy()
@Component({
  selector: 'app-builds-items',
  templateUrl: './builds-items.component.html',
  styleUrls: ['./builds-items.component.sass']
})
export class BuildsItemsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() options: BuildsItemsOptions = { type: 'latest' };

  builds: Build[] = [];
  fetchingBuilds = false;
  fetchingMore = false;
  hideMoreButton = false;
  limit = 5;
  offset = 0;
  error: string | null = null;
  sub: Subscription = new Subscription();

  constructor(private buildsService: BuildsService, private dataService: DataService) { }

  ngOnInit(): void {
    this.initDataEvents();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.dataService.unsubscribeAll();
  }

  ngOnChanges(): void {
    this.builds = [];
    this.limit = 5;
    this.offset = 0;
    this.error = null;
    if (this.options.type) {
      this.find();
    }
  }

  find(): void {
    if (this.offset === 0) {
      this.fetchingBuilds = true;
    } else {
      this.fetchingMore = true;
    }

    const params: BuildsFindParams = {
      type: this.options.type,
      limit: this.limit,
      offset: this.offset
    };
    if (this.options.repoID) {
      params.repoID = this.options.repoID;
    }

    this.buildsService
      .find(params)
      .pipe(
        finalize(() => {
          this.fetchingBuilds = false;
          this.fetchingMore = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.builds = this.builds.concat(resp);
          if (resp.length === this.limit) {
            this.offset += resp.length;
          } else {
            this.hideMoreButton = true;
          }
        },
        err => {
          this.error = err.message;
        }
      );
  }

  private initDataEvents(): void {
    this.sub.add(this.buildsService.buildsEvents().subscribe(build => this.builds.unshift(build)));
    this.sub.add(this.buildsService.jobEvents().subscribe(ev => this.updateJobFromEvent(ev)));

    this.buildsService.subscribeToBuildsEvents();
    this.buildsService.subscribeToJobEvents();
  }

  private updateJobFromEvent(ev: SocketEvent): void {
    if (!this.builds || !this.builds.length) {
      return;
    }

    const build = this.builds.find(b => b.id === ev.data.buildID);
    if (!build || !build.jobs || !build.jobs.length) {
      return;
    }

    const job = build.jobs.find(j => j.id === ev.data.jobID);
    if (!job) {
      return;
    }

    if (!job.endTime) {
      build.startTime = null;
      build.endTime = null;
    }

    job.startTime = ev.data.startTime ? new Date(ev.data.startTime) : null;
    job.endTime = ev.data.endTime ? new Date(ev.data.endTime) : null;
    job.status = ev.data.status;
  }
}
