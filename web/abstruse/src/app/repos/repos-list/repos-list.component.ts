import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Repo } from '../shared/repo.model';
import { Subscription, Subject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-repos-list',
  templateUrl: './repos-list.component.html',
  styleUrls: ['./repos-list.component.sass']
})
export class ReposListComponent implements OnInit {
  repos: Repo[] = [];
  fetching: boolean;
  searchKeyword: string;
  searchInput: Subject<string> = new Subject<string>();
  sub: Subscription = new Subscription();

  constructor(
    private reposService: ReposService
  ) { }

  ngOnInit(): void {
    this.list();

    this.sub.add(
      this.searchInput
        .pipe(
          filter(keyword => keyword.length > 1),
          debounceTime(500),
          distinctUntilChanged()
        )
        .subscribe((keyword: string) => {
          this.search(keyword);
        })
    );
  }

  list(): void {
    this.fetching = true;
    this.reposService.list()
      .subscribe(resp => {
        this.repos = resp;
      }, err => {
        console.log(err);
        this.repos = [];
        this.fetching = false;
      }, () => {
        this.fetching = false;
      });
  }

  search(keyword: string): void {
    this.fetching = true;
    this.reposService.search(keyword)
      .subscribe(repos => {
        this.repos = repos;
      }, err => {
        console.error(err);
        this.fetching = false;
        this.repos = [];
      }, () => {
        this.fetching = false;
      });
  }

  onSearchInputChange(keyword: string): void {
    if (this.searchKeyword.length < 1) {
      this.list();
    }
    this.searchInput.next(keyword);
  }
}
