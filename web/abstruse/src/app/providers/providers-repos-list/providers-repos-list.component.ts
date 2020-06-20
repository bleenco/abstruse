import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProviderRepo } from '../shared/repo.class';
import { ProvidersService } from '../shared/providers.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Provider } from '../shared/provider.class';

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
  fetchingProvider: boolean;
  repos: ProviderRepo[] = [];
  provider: Provider;
  searchSub: Subscription = new Subscription();
  page = 1;
  size = 30;

  constructor(private route: ActivatedRoute, private providersService: ProvidersService) {}

  ngOnInit(): void {
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
    this.findProvider();
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
    if (this.search.length < 1) {
      this.page = 1;
      this.listRepos();
    }
    this.searchInput.next(term);
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
  }

  listRepos(): void {
    this.fetching = true;
    this.providersService.listRepos(this.providerId, this.page, this.size).subscribe(
      repos => {
        this.repos = repos;
      },
      err => {
        this.fetching = false;
        this.repos = [];
        console.error(err);
      },
      () => {
        this.fetching = false;
      }
    );
  }

  prev(): void {
    this.page--;
    this.listRepos();
  }

  next(): void {
    this.page++;
    this.listRepos();
  }

  findRepos(keyword: string): void {
    this.fetching = true;
    this.providersService.reposFind(this.providerId, keyword).subscribe(
      repo => {
        this.repos = [repo];
      },
      err => {
        this.fetching = false;
        console.error(err);
        this.repos = [];
      },
      () => {
        this.fetching = false;
      }
    );
  }

  findProvider(): void {
    this.fetchingProvider = true;
    this.providersService.find(this.providerId).subscribe(
      provider => {
        this.provider = provider;
      },
      err => {
        this.fetchingProvider = false;
        console.error(err);
      },
      () => {
        this.fetchingProvider = false;
      }
    );
  }
}
