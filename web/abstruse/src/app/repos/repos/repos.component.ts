import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Repo } from '../shared/repo.model';
import { finalize } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-repos',
  templateUrl: './repos.component.html',
  styleUrls: ['./repos.component.sass']
})
export class ReposComponent implements OnInit {
  repos: Repo[] = [];
  loading: boolean = false;
  loaded: boolean = false;
  error: string | null = null;
  limit: number = 10;
  page: number = 1;
  count!: number;
  pages: number[] = [];

  constructor(private reposService: ReposService) {}

  ngOnInit(): void {
    this.find();
  }

  find(): void {
    this.loading = true;
    this.reposService
      .find(this.limit, (this.page - 1) * this.limit)
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

  initPages(): void {
    this.pages = [...new Array(Math.ceil(this.count / this.limit))].map((_, i) => i + 1);
  }
}
