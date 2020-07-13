import { Component, OnInit } from '@angular/core';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Provider } from '../shared/provider.class';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { randomHash } from 'src/app/shared';

@Component({
  selector: 'app-providers-modal',
  templateUrl: './providers-modal.component.html',
  styleUrls: ['./providers-modal.component.sass']
})
export class ProvidersModalComponent implements OnInit {
  provider!: Provider;
  providerList = [
    { value: 'github', placeholder: 'GitHub' },
    { value: 'gitlab', placeholder: 'GitLab' },
    { value: 'bitbucket', placeholder: 'Bitbucket' },
    { value: 'gitea', placeholder: 'Gitea' },
    { value: 'gogs', placeholder: 'Gogs' }
  ];
  saving: boolean = false;
  checking: boolean = false;
  form!: FormGroup;

  constructor(private fb: FormBuilder, public activeModal: ActiveModal) {
    this.createForm();
  }

  ngOnInit(): void {}

  onSubmit(): void {}

  updateProviderURL(): void {
    switch (this.form.controls.name.value) {
      case 'github':
        this.form.patchValue({ url: 'https://api.github.com' });
        break;
      case 'gitlab':
        this.form.patchValue({ url: 'https://gitlab.com' });
        break;
      case 'bitbucket':
        this.form.patchValue({ url: 'https://api.bitbucket.org' });
        break;
      default:
        this.form.patchValue({ url: '' });
    }
  }

  generateSecret(): void {
    this.form.patchValue({ secret: randomHash(10) });
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      url: [null, [Validators.required]],
      accessToken: [null, [Validators.required]],
      secret: [null, [Validators.required]]
    });
  }
}
