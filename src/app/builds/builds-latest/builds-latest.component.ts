import { Component, OnInit, OnDestroy } from '@angular/core';
import { BuildService } from '../shared/build.service';
import { Build, BuildStatus } from '../shared/build.model';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/providers/data.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-builds-latest',
  templateUrl: './builds-latest.component.html',
  styleUrls: ['./builds-latest.component.sass']
})
export class BuildsLatestComponent implements OnInit, OnDestroy {
  builds: Build[] = [];
  loading: boolean;
  fetchingBuilds: boolean;
  hideMoreButton: boolean;
  show: 'all' | 'pr' | 'commits';
  limit: number;
  offset: number;
  buildsSubAdded: Subscription;
  buildsSub: Subscription;
  buildsSubUpdate: Subscription;

  constructor(public buildService: BuildService, public dataService: DataService) { }

  ngOnInit() {
    this.resetFields();
    this.fetchBuilds();
    this.subscribeToBuilds();
  }

  ngOnDestroy() {
    this.resetFields();
    this.unsubscribeFromBuilds();
  }

  switchTab(tab: 'all' | 'commits' | 'pr'): void {
    if (this.show === tab) {
      return;
    }

    this.resetFields();
    this.show = tab;
    this.fetchBuilds();
  }

  private subscribeToBuilds(): void {
    this.buildsSubAdded = this.dataService.socketOutput
      .pipe(filter(x => x.type !== 'data'))
      .subscribe(event => {
        if (!this.builds || !event.data) {
          return;
        }

        if (event.data === 'build added' && event.additionalData) {
          if (!this.builds) {
            this.builds = [];
          }

          Promise.resolve()
            .then(() => this.buildService.generateBuild(event.additionalData).toPromise())
            .then((build: Build) => this.builds.unshift(build))
            .then(() => this.buildService.updateBuilds(this.builds));
        }
      });

    this.buildsSub = this.dataService.socketOutput
      .pipe(
        filter(x => {
          x = x.data ? x.data.toString() : '';
          return x.startsWith('job');
        })
      )
      .subscribe(e => {
        const build = this.builds.findIndex(b => b.id === e.build_id);
        if (build === -1) {
          return;
        }

        const index = this.builds[build].jobs.findIndex(job => job.id === e.job_id);
        if (index !== -1) {
          switch (e.data) {
            case 'job succeded':
              this.builds[build].jobs[index].status = BuildStatus.passed;
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
            case 'job queued':
              this.builds[build].jobs[index].status = BuildStatus.queued;
              break;
            case 'job started':
              this.builds[build].jobs[index].status = BuildStatus.running;
              this.builds[build].jobs[index].start_time = e.additionalData;
              this.builds[build].jobs[index].end_time = null;
              break;
            case 'job failed':
              this.builds[build].jobs[index].status = BuildStatus.failed;
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
            case 'job stopped':
              this.builds[build].jobs[index].status = BuildStatus.failed;
              this.builds[build].jobs[index].end_time = e.additionalData;
              break;
          }

          this.buildService.updateBuilds(this.builds);
        }
      });

    this.buildsSubUpdate = this.dataService.socketOutput
      .pipe(
        filter(event => event.data === 'build restarted' || event.data === 'build succeeded' || event.data === 'build failed')
      )
      .subscribe(event => {
        const index = this.builds.findIndex(i => i.id === event.build_id);
        if (index !== -1) {
          if (event.data === 'build restarted') {
            this.builds[index].start_time = event.additionalData;
          } else {
            this.builds[index].end_time = event.additionalData;
            this.buildService.updateBuilds(this.builds);
          }
        }
      });
  }

  private unsubscribeFromBuilds(): void {
    if (this.buildsSubAdded) {
      this.buildsSubAdded.unsubscribe();
    }
    if (this.buildsSub) {
      this.buildsSub.unsubscribe();
    }
    if (this.buildsSubUpdate) {
      this.buildsSubUpdate.unsubscribe();
    }
  }

  private fetchBuilds(): void {
    this.fetchingBuilds = true;
    this.buildService.fetchBuilds(this.limit, this.offset, this.show)
      .subscribe((builds: Build[]) => {
        this.builds = this.builds.concat(builds.sort((a, b) => b.id - a.id));
        this.loading = false;
        this.fetchingBuilds = false;
        if (builds.length === this.limit) {
          this.offset += 5;
          this.hideMoreButton = false;
        } else {
          this.hideMoreButton = true;
        }
      });
  }

  private resetFields(): void {
    this.builds = [];
    this.loading = true;
    this.fetchingBuilds = false;
    this.show = 'all';
    this.limit = 5;
    this.offset = 0;
  }
}
