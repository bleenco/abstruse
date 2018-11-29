import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-settings-integration-repo-item',
  templateUrl: './settings-integration-repo-item.component.html',
  styleUrls: ['./settings-integration-repo-item.component.sass']
})
export class SettingsIntegrationRepoItemComponent implements OnInit {
  @Input() repo: any;
  @Input() provider: 'github' | 'gitlab' | 'bitbucket' | 'gogs' | 'gitea';

  processing: boolean;

  constructor() { }

  ngOnInit() { }
}
