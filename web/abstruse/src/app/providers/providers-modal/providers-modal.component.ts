import { Component, OnInit } from '@angular/core';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Provider } from '../shared/provider.class';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { randomHash } from 'src/app/shared';
import { ProvidersService } from '../shared/providers.service';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
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
  saving = false;
  checking = false;
  form!: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private providers: ProvidersService, public activeModal: ActiveModal) {}

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.error = null;
    this.saving = true;
    let data: any = {
      name: this.form.controls.name.value,
      url: this.form.controls.url.value,
      host: this.form.controls.host.value,
      accessToken: this.form.controls.accessToken.value,
      secret: this.form.controls.secret.value
    };
    if (this.provider && this.provider.id) {
      data = { ...data, ...{ id: this.provider.id } };
    }

    if (data.id) {
      this.providers
        .update(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          () => {
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    } else {
      this.providers
        .create(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          () => {
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    }
  }

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
      name: [(this.provider && this.provider.name) || null, [Validators.required]],
      url: [(this.provider && this.provider.url) || null, [Validators.required]],
      host: [(this.provider && this.provider.host) || window.location.origin, [Validators.required]],
      accessToken: [(this.provider && this.provider.accessToken) || null],
      secret: [(this.provider && this.provider.secret) || null, [Validators.required]]
    });
  }
}
