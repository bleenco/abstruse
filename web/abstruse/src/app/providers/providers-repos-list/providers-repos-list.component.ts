import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProviderRepo } from '../shared/repo.class';
import { ProvidersService } from '../shared/providers.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-providers-repos-list',
  templateUrl: './providers-repos-list.component.html',
  styleUrls: ['./providers-repos-list.component.sass']
})
export class ProvidersReposListComponent implements OnInit, OnDestroy {
  search: string;
  searchInput: Subject<string> = new Subject<string>();
  providerId: number;
  fetching: boolean;
  repos: ProviderRepo[] = [];
  searchSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private providersService: ProvidersService
  ) { }

  ngOnInit(): void {
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
    this.listRepos();

    this.searchSub = this.searchInput
      .pipe(
        filter(keyword => keyword.length > 1),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((keyword: string) => {
        this.findRepos(keyword);
      });
  }

  onSearchInputChange(term: string): void {
    this.searchInput.next(term);
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
  }

  listRepos(): void {
    this.fetching = true;
    this.providersService.listRepos(this.providerId)
      .subscribe(repos => {
        this.repos = this.repos.concat(repos);
      }, err => {
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }

  findRepos(keyword: string): void {
    this.fetching = true;
    this.providersService.reposFind(this.providerId, keyword)
      .subscribe(repo => {
        this.repos = [repo];
      }, err => {
        this.repos = [];
      }, () => {
        this.fetching = false;
      });
  }
}
