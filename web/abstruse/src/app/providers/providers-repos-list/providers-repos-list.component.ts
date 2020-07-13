import { Component, OnInit } from '@angular/core';
import { ProviderRepo } from '../shared/provider-repo.class';
import { ProvidersService } from '../shared/providers.service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-providers-repos-list',
  templateUrl: './providers-repos-list.component.html',
  styleUrls: ['./providers-repos-list.component.sass']
})
export class ProvidersReposListComponent implements OnInit {
  providerID!: number;
  repos: ProviderRepo[] = [];
  loading: boolean = false;
  page = 1;
  size = 30;
  error: string | null = null;

  constructor(private providersService: ProvidersService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.providerID = Number(this.route.snapshot.paramMap.get('id'));
    this.findRepos();
  }

  findRepos(): void {
    this.loading = true;
    this.providersService
      .findRepos(this.providerID, this.page, this.size)
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        repos => {
          this.repos = repos;
        },
        err => {
          this.error = err.message;
        }
      );
  }

  prev(): void {
    this.page--;
    this.findRepos();
  }

  next(): void {
    this.page++;
    this.findRepos();
  }
}
