import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from 'src/app/builds/shared/build.service';
import { Build, generateBuildModel } from 'src/app/builds/shared/build.model';
import { Repo, generateRepoModel } from '../shared/repo.model';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-repositories-details',
  templateUrl: './repositories-details.component.html',
  styleUrls: ['./repositories-details.component.sass']
})
export class RepositoriesDetailsComponent implements OnInit, OnDestroy {
  id: number;
  fetching: boolean;
  fetchingBuilds: boolean;
  repo: Repo;
  builds: Build[] = [];
  tab: 'all' | 'commits' | 'pr';
  processing: boolean;
  sub: Subscription;

  constructor(
    public repos: ReposService,
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.tab = 'all';
    this.fetching = true;
    this.fetchingBuilds = true;

    this.fetchRepository();
    this.buildService.subscribeToBuildEvents();

    this.sub = this.buildService.socketEvents().subscribe((ev: SocketEvent) => {
      console.log(ev);
      this.updateBuildFromEvent(ev);
    });
  }

  ngOnDestroy() {
    this.buildService.unsubscribeFromBuildEvents();
    this.sub.unsubscribe();
  }

  switchTab(tab: 'all' | 'commits' | 'pr'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;
  }

  triggerBuild(): void {
    this.processing = true;
    this.buildService.triggerBuild().subscribe(resp => {
      if (resp && resp.data) {
        console.log('yes');
      }
    }, err => {
      console.error(err);
    }, () => {
      this.processing = false;
    });
  }

  fetchRepository(): void {
    this.fetching = true;
    this.repos.fetchRepository(this.id).subscribe(resp => {
      if (resp && resp.data) {
        this.repo = generateRepoModel(resp.data);
        this.fetchRepositoryBuilds();
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }

  fetchRepositoryBuilds(): void {
    this.fetchingBuilds = true;
    this.buildService.fetchBuildsByRepoID(this.id).subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.builds = resp.data.map((build: any) => generateBuildModel(build));
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingBuilds = false;
    });
  }

  updateBuildFromEvent(ev: SocketEvent): void {
    if (!this.builds || !this.builds.length) {
      return;
    }

    const build = this.builds.find(b => b.id === ev.data.build_id);
    if (!build) {
      return;
    }

    build.start_time = ev.data.start_time ? new Date(ev.data.start_time) : build.start_time;
    build.end_time = ev.data.end_time ? new Date(ev.data.end_time) : build.end_time;
    build.status = ev.data.status || 'queued';
  }
}
