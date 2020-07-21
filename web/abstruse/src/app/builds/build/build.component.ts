import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { DataService } from 'src/app/shared/providers/data.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Build } from '../shared/build.model';
import { finalize, filter } from 'rxjs/operators';
import { SocketEvent } from 'src/app/shared/models/socket.model';

@UntilDestroy()
@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.sass']
})
export class BuildComponent implements OnInit, OnDestroy {
  id!: number;
  build!: Build;
  loading: boolean = false;
  processing: boolean = false;
  tab: 'jobs' | 'config' = 'jobs';
  title: string = 'Jobs';
  editorOptions = { language: 'yaml', theme: 'abstruse', readOnly: true };

  constructor(private route: ActivatedRoute, private buildsService: BuildsService, private dataService: DataService) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.findBuild();
    this.buildsService
      .jobEvents()
      .pipe(untilDestroyed(this))
      .subscribe((ev: SocketEvent) => this.updateJobFromEvent(ev));
    this.buildsService.subscribeToJobEvents();

    this.route.queryParams
      .pipe(
        filter(ev => ev.tab),
        untilDestroyed(this)
      )
      .subscribe(ev => {
        this.tab = ev.tab;
        this.title = this.tab === 'jobs' ? 'Jobs' : 'Build Config';
      });
  }

  ngOnDestroy(): void {
    this.dataService.unsubscribeAll();
  }

  findBuild(): void {
    this.loading = true;
    this.buildsService
      .findBuild(this.id)
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(resp => (this.build = resp));
  }

  restartBuild(): void {
    this.processing = true;
    this.buildsService
      .restartBuild(this.id)
      .pipe(
        finalize(() => (this.processing = false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  stopBuild(): void {
    this.processing = true;
    this.buildsService
      .stopBuild(this.id)
      .pipe(
        finalize(() => (this.processing = false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private updateJobFromEvent(ev: SocketEvent): void {
    if (!this.build || this.build.id !== ev.data.buildID) {
      return;
    }

    const job = this.build.jobs.find(j => j.id === ev.data.jobID);
    if (!job) {
      return;
    }

    job.startTime = ev.data.startTime ? new Date(ev.data.startTime) : null;
    job.endTime = ev.data.endTime ? new Date(ev.data.endTime) : null;
    job.status = ev.data.status;
  }
}
