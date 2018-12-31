import { Component, OnInit } from '@angular/core';
import { IntegrationService } from '../shared/integration.service';

export class GitHubForm {
  constructor(
    public url: string = 'https://github.com',
    public access_token: string = '',
    public username: string = '',
    public password: string = ''
  ) { }
}

@Component({
  selector: 'app-settings-integration-dialog',
  templateUrl: './settings-integration-dialog.component.html',
  styleUrls: ['./settings-integration-dialog.component.sass']
})
export class SettingsIntegrationDialogComponent implements OnInit {
  loading: boolean;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'gitea';
  githubProviderForm: GitHubForm;

  constructor(public integration: IntegrationService) { }

  ngOnInit() {
    this.provider = null;
    this.loading = false;
    this.githubProviderForm = new GitHubForm();
  }

  chooseProvider(provider: 'github' | 'gitlab' | 'bitbucket' | 'gitea'): void {
    this.provider = provider;
  }

  checkIntegration(): void {
    this.loading = true;
    let data: any;
    switch (this.provider) {
      case 'github':
        data = this.githubProviderForm;
        break;
    }

    this.integration.checkIntegrationValidity(this.provider, data)
      .subscribe(resp => {
        if (resp.data) {
          this.integration.closeIntegrationDialog();
        } else {

        }
      }, err => {
        console.log(err);
      }, () => {
        this.loading = false;
      });
  }

}
