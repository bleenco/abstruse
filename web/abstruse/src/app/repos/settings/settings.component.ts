import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { switchMap, finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Hook } from '../shared/hook.model';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  loading: boolean = false;
  hooks: { push: boolean; pullRequest: boolean; tag: boolean } = {
    push: false,
    pullRequest: false,
    tag: false
  };

  constructor(public reposService: ReposService) {}

  ngOnInit(): void {
    this.findHooks();
  }

  findHooks(): void {
    this.loading = true;
    this.reposService
      .findHooks()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.applySettings(resp);
        },
        err => {
          console.error(err);
        }
      );
  }

  private applySettings(hooks: Hook[]): void {
    hooks.forEach(hook => {
      if (hook.active && hook.events.includes('push')) {
        this.hooks.push = true;
      }
      if (hook.active && (hook.events.includes('create') || hook.events.includes('tag'))) {
        this.hooks.tag = true;
      }
      if (hook.active && hook.events.includes('pull_request')) {
        this.hooks.pullRequest = true;
      }
    });
  }
}
