import { Component, OnInit, Input } from '@angular/core';
import { ReposService } from '../shared/repos.service';
import { Hook } from '../shared/hook.model';
import { getAPIURL } from 'src/app/core/shared/shared-functions';

@Component({
  selector: 'app-repositories-configuration-dialog',
  templateUrl: './repositories-configuration-dialog.component.html',
  styleUrls: ['./repositories-configuration-dialog.component.sass']
})
export class RepositoriesConfigurationDialogComponent implements OnInit {
  @Input() repo: any;
  tab: 'webhooks' | 'file';
  fetchingHooks: boolean;
  hooks: any[];
  hook: Hook;
  saving: boolean;

  constructor(
    public repos: ReposService
  ) { }

  ngOnInit() {
    this.hook = new Hook(getAPIURL() + `/webhooks/github`);
    this.switchTab('webhooks');
  }

  switchTab(tab: 'webhooks' | 'file'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;

    switch (tab) {
      case 'webhooks': this.fetchWebhooks(); break;
    }
  }

  fetchWebhooks(): void {
    this.fetchingHooks = true;
    this.repos.fetchRepositoryWebhooks(this.repo.id).subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.hooks = resp.data.map(h => {
          return new Hook(
            h.config.url, h.events.includes('push'), h.events.includes('pull_request'),
            h.id, h.config.content_type, h.active, new Date(h.created_at), new Date(h.updated_at)
          );
        });
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingHooks = false;
    });
  }

  addWebhook(): void {
    this.saving = true;
    this.repos.addRepositoryWebhook(this.repo.id, this.hook).subscribe(resp => {
      if (resp && resp.data) {
        this.hooks.push(resp.data);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.saving = false;
    });
  }
}
