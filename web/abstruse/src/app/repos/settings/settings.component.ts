import { Component, OnInit } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { filter, finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Hook, HookData } from '../shared/hook.model';
import { BuildsService } from 'src/app/builds/shared/builds.service';
import { ActivatedRoute } from '@angular/router';
import { Repo } from '../shared/repo.model';
import * as copy from 'copy-text-to-clipboard';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  id!: number;
  repo!: Repo;
  loading = false;
  saving = false;
  triggeringBuild = false;
  buildTriggered = false;
  hooks: { push: boolean; pullRequest: boolean; tag: boolean } = {
    push: false,
    pullRequest: false,
    tag: false
  };
  config = '';
  fetchingConfig = false;
  editorOptions = { language: 'yaml', theme: 'abstruse' };
  branch = 'master';
  error: string | null = null;
  configError: string | null = null;
  triggerError: string | null = null;

  get badgeURL(): string {
    if (!this.repo?.token) {
      return '';
    }

    return window.location.origin + `/badge/${this.repo.token}?branch=${this.branch}`;
  }

  get badgeMarkdown(): string {
    if (!this.repo?.token) {
      return '';
    }

    const badge = window.location.origin + `/badge/${this.repo.token}?branch=${this.branch}`;
    const url = window.location.origin + `/repos/${this.repo.id}`;
    return `[![Build Status](${badge})](${url})`;
  }

  constructor(
    public reposService: ReposService,
    private buildsService: BuildsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.parent?.snapshot.paramMap.get('id'));

    this.reposService.repoSubject
      .pipe(
        filter(r => !!r),
        untilDestroyed(this)
      )
      .subscribe(repo => {
        this.repo = repo as Repo;
        this.branch = repo?.defaultBranch as string;
      });

    this.findHooks();
  }

  copyTextToClipboard(text: string): void {
    copy.default(text);
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
          this.error = err.message;
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
          this.error = err.message;
        }
      );
  }

  triggerBuild(): void {
    this.triggeringBuild = true;
    this.triggerError = null;
    this.buildsService
      .triggerBuild({ id: this.id, config: this.config })
      .pipe(
        finalize(() => (this.triggeringBuild = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.buildTriggered = true;
        },
        err => (this.triggerError = err.message)
      );
  }

  fetchConfig(): void {
    this.fetchingConfig = true;
    this.configError = null;
    this.reposService
      .findConfig(this.id)
      .pipe(
        finalize(() => (this.fetchingConfig = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.config = resp.content;
        },
        err => {
          this.configError = err.message;
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
