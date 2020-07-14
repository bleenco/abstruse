import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Hook, HookData } from '../shared/hook.model';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  loading: boolean = false;
  saving: boolean = false;
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

  saveHooks(): void {
    this.saving = true;

    const data: HookData = {
      branch: this.hooks.push,
      push: this.hooks.push,
      pullRequest: this.hooks.pullRequest,
      tag: this.hooks.tag
    };

    this.reposService
      .saveHooks(data)
      .pipe(
        finalize(() => (this.saving = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {},
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
