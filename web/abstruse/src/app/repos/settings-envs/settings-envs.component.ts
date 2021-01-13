import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ReposService } from '../shared/repos.service';
import { EnvVariable } from './env-variable.model';

@UntilDestroy()
@Component({
  selector: 'app-settings-envs',
  templateUrl: './settings-envs.component.html',
  styleUrls: ['./settings-envs.component.sass']
})
export class SettingsEnvsComponent implements OnInit {
  id!: number;
  envs: EnvVariable[] = [];
  fetching = false;
  fetchingError = null;

  constructor(private route: ActivatedRoute, private reposService: ReposService) {}

  ngOnInit(): void {
    this.id = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.findEnvs();
  }

  findEnvs(): void {
    this.fetching = true;
    this.reposService
      .findEnvs()
      .pipe(
        finalize(() => (this.fetching = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.envs = resp;
        },
        err => {
          this.fetchingError = err.message;
        }
      );
  }
}
