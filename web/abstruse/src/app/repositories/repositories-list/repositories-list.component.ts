import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Repo, generateRepoModel } from '../shared/repo.model';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.sass']
})
export class RepositoriesListComponent implements OnInit {
  fetchingRepositories: boolean;
  repositories: Repo[] = [];
  displayedRepositories: Repo[] = [];
  sortOptions: { value: any,  placeholder: string }[] = [
    { placeholder: 'Last Build ASC', value: 'updated_at asc' },
    { placeholder: 'Last Build DESC', value: 'updated_at desc' },
    { placeholder: 'Name ASC', value: 'name asc' },
    { placeholder: 'Name DESC', value: 'name desc' }
  ];
  sortValue = 'updated_at desc';
  searchKeyword: string;
  fuseSearchOptions = {
    keys: [
      { name: 'full_name', weight: 0.8 },
      { name: 'name', weight: 0.7 }
    ]
  };

  constructor(
    public repos: ReposService
  ) { }

  ngOnInit() {
    this.fetchingRepositories = true;
    this.fetchRepositories();
  }

  fetchRepositories(): void {
    this.fetchingRepositories = true;
    this.repos.fetchRepositories(this.sortValue).subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.repositories = resp.data.map(generateRepoModel);
        this.displayedRepositories = this.repositories;
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingRepositories = false;
    });
  }

  onSort(): void {
    this.fetchRepositories();
  }

  onSearch(): void {
    if (this.searchKeyword.length > 1) {
      const fuse = new Fuse(this.repositories, this.fuseSearchOptions);
      this.displayedRepositories = fuse.search(this.searchKeyword);
    } else {
      this.displayedRepositories = this.repositories;
    }
  }

}
