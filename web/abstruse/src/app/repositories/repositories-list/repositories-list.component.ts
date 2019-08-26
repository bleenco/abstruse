import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Repo, generateRepoModel } from '../shared/repo.model';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.sass']
})
export class RepositoriesListComponent implements OnInit {
  fetchingRepositories: boolean;
  repositories: Repo[] = [];

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
      if (resp && resp.data && resp.data.length) {
        this.repositories = resp.data.map(generateRepoModel);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingRepositories = false;
    });
  }

}
