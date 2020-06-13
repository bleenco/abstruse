import { Component, OnInit } from '@angular/core';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Provider } from '../shared/provider.class';
import { ProvidersService } from '../shared/providers.service';

@Component({
  selector: 'app-providers-modal',
  templateUrl: './providers-modal.component.html',
  styleUrls: ['./providers-modal.component.sass']
})
export class ProvidersModalComponent implements OnInit {
  provider: Provider;
  providerList = [
    { value: 'github', placeholder: 'GitHub' },
    { value: 'gitlab', placeholder: 'GitLab' },
    { value: 'bitbucket', placeholder: 'Bitbucket' },
    { value: 'gitea', placeholder: 'Gitea' },
    { value: 'gogs', placeholder: 'Gogs' },
    { value: 'stash', placeholder: 'Stash' },
  ];
  saving: boolean;
  checking: boolean;

  constructor(
    public providersService: ProvidersService,
    public activeModal: ActiveModal
  ) { }

  ngOnInit(): void { }

  save(): void {
    this.saving = true;
    if (this.provider.id) {
      this.providersService.update(this.provider)
        .subscribe(resp => {
          if (resp.data) {
            this.activeModal.close(true);
          }
        }, err => {
          console.error(err);
          this.saving = false;
        }, () => {
          this.saving = false;
        });
    } else {
      this.providersService.create(this.provider)
        .subscribe(resp => {
          if (resp.data) {
            this.activeModal.close(true);
          }
        }, err => {
          console.error(err);
          this.saving = false;
        }, () => {
          this.saving = false;
        });
    }
  }

  updateProviderURL(): void {
    switch (this.provider.name) {
      case 'github': this.provider.url = 'https://api.github.com'; break;
      case 'gitlab': this.provider.url = 'https://gitlab.com'; break;
      case 'bitbucket': this.provider.url = 'https://api.bitbucket.org'; break;
      default: this.provider.url = '';
    }
  }
}
