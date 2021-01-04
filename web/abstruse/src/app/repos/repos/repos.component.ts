import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Repo } from '../shared/repo.model';
import { finalize, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.sass']
})
export class ReposComponent implements OnInit, AfterViewInit {
  @ViewChild('keyword') keyword!: ElementRef;

  repos: Repo[] = [];
  loading = false;
  loaded = false;
  error: string | null = null;
  limit = 10;
  page = 1;
  count!: number;
  pages: { page: number; display: boolean }[] = [];
  maxPages = 5;

  constructor(private reposService: ReposService) {}

  ngOnInit(): void {
    this.find();
  }

  ngAfterViewInit(): void {
    fromEvent(this.keyword.nativeElement, 'keyup')
      .pipe(
        map(() => this.keyword.nativeElement.value),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.limit = 10;
          this.page = 1;
        }),
        untilDestroyed(this)
      )
      .subscribe(keyword => {
        this.find(keyword);
      });
  }

  find(keyword: string = ''): void {
    this.loading = true;
    this.reposService
      .find(this.limit, (this.page - 1) * this.limit, keyword)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loaded = true;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.repos = resp.data;
          this.count = resp.count;
          this.initPages();
        },
        err => {
          this.error = err.message;
        }
      );
  }

  setPage(page: number): void {
    this.page = page;
    this.find();
  }

  back(): void {
    if (this.page === 1) {
      return;
    }
    this.page--;
    this.find();
  }

  next(): void {
    if (this.page === Math.ceil(this.count / this.limit)) {
      return;
    }
    this.page++;
    this.find();
  }

  first(): void {
    this.page = 1;
    this.find();
  }

  last(): void {
    this.page = Math.ceil(this.count / this.limit);
    this.find();
  }

  initPages(): void {
    this.pages = [...new Array(Math.ceil(this.count / this.limit))].map((_, i) => {
      const page = i + 1;
      const display = page - this.maxPages <= this.page && page + this.maxPages >= this.page;

      return { page, display };
    });
  }
}
