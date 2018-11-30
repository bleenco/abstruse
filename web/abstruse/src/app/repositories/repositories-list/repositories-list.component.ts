import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.sass']
})
export class RepositoriesListComponent implements OnInit {
  fetchingRepositories: boolean;
  repositories: any[];

  constructor(
    public repos: ReposService
  ) { }

  ngOnInit() {
    this.fetchingRepositories = true;
    this.fetchRepositories();
  }

  fetchRepositories(): void {
    this.fetchingRepositories = true;
    this.repos.fetchRepositories().subscribe(resp => {
      if (resp && resp.data) {
        this.repositories = resp.data;
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingRepositories = false;
    });
  }

}
