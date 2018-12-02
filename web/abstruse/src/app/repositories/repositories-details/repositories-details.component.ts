import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from 'src/app/builds/shared/build.service';

@Component({
  selector: 'app-repositories-details',
  templateUrl: './repositories-details.component.html',
  styleUrls: ['./repositories-details.component.sass']
})
export class RepositoriesDetailsComponent implements OnInit {
  id: number;
  fetching: boolean;
  repo: any;
  tab: 'all' | 'commits' | 'pr';
  processing: boolean;

  constructor(
    public repos: ReposService,
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.tab = 'all';
    this.fetching = true;
    this.fetchRepository();
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
        this.repo = resp.data;
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }
}
