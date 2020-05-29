import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProviderRepo } from '../shared/repo.class';
import { ProvidersService } from '../shared/providers.service';
import { Subscription, fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((term: string) => {
        console.log(term);
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
        this.repos = repos;
      }, err => {
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }
}
