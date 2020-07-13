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
  error: string | null = null;

  constructor(private reposService: ReposService) {}

  ngOnInit(): void {
    this.find();
  }

  find(): void {
    this.loading = true;
    this.reposService
      .find()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.repos = resp;
        },
        err => {
          this.error = err.message;
        }
      );
  }
}
