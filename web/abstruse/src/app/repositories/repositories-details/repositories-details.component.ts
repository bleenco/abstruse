import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    public repos: ReposService,
    public route: ActivatedRoute
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
