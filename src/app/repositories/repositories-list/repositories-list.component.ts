import { Component, OnInit } from '@angular/core';
import { RepositoriesService } from '../shared/repositories.service';
import { Repository } from '../shared/repository.model';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.sass']
})
export class RepositoriesListComponent implements OnInit {
  repos: Repository[] = [];
  displayedRepos: Repository[] = [];
  fetching: boolean;
  fuse: any;
  searchKeyword: string;

  constructor(public service: RepositoriesService) { }

  ngOnInit() {
    this.fetchRepositories();
  }

  fetchRepositories(): void {
    this.fetching = true;
    this.service.fetchRepositories().subscribe(resp => {
      if (resp && resp.data) {
        this.repos = resp.data.map(repo => {
          const provider = repo.repository_provider;
          let provider_id = null;
          switch (provider) {
            case 'github': provider_id = repo.github_id; break;
            case 'bitbucket': provider_id = repo.bitbucket_id; break;
            case 'gitlab': provider_id = repo.gitlab_id; break;
            case 'gogs': provider_id = repo.gogs_id; break;
          }

          return new Repository(
            repo.id,
            repo.name,
            repo.full_name,
            provider,
            provider_id,
            repo.html_url,
            repo.api_url,
            repo.default_branch,
            repo.description,
            Boolean(repo.fork),
            Boolean(repo.public),
            repo.access_tokens_id
          );
        });
      }

      this.displayedRepos = [...this.repos];
      this.fetching = false;
    });
  }

  onKeywordChanged(): void {
    if (this.searchKeyword === '') {
      this.displayedRepos = [...this.repos];
      return;
    }

    const options = {
      keys: ['name', 'full_name', 'repository_provider', 'description', 'html_url'] as any[],
      id: 'id'
    };
    this.fuse = new Fuse(this.repos, options);
    const ids = this.fuse.search(this.searchKeyword).map(id => Number(id));
    this.displayedRepos = this.repos.filter(repo => ids.indexOf(Number(repo.id)) !== -1);
  }
}
