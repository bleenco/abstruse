import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { EnvVariable } from '../settings-envs/env-variable.model';
import { ReposService } from '../shared/repos.service';

@UntilDestroy()
@Component({
  selector: 'app-settings-env-modal',
  templateUrl: './settings-env-modal.component.html',
  styleUrls: ['./settings-env-modal.component.sass']
})
export class SettingsEnvModalComponent implements OnInit {
  env!: EnvVariable;
  saving = false;
  checking = false;
  form!: FormGroup;
  error: string | null = null;
  deleting = false;

  constructor(
    private fb: FormBuilder,
    private reposService: ReposService,
    public activeModal: ActiveModal
  ) {}

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
      key: String(this.form.controls.key.value).toUpperCase(),
      value: String(this.form.controls.value.value),
      secret: Boolean(this.form.controls.secret.value)
    };
    if (this.env && this.env.id) {
      data = { ...data, ...{ id: Number(this.env.id) } };
    }

    if (data.id) {
      this.reposService
        .updateEnv(data)
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
      this.reposService
        .createEnv(data)
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

  delete(): void {
    if (!this.env || !this.env.id) {
      return;
    }

    this.deleting = true;
    this.reposService
      .deleteEnv(this.env)
      .pipe(
        finalize(() => (this.deleting = false)),
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

  private createForm(): void {
    this.form = this.fb.group({
      key: [(this.env && this.env.key) || null, [Validators.required]],
      value: [(this.env && this.env.value) || null, [Validators.required]],
      secret: [(this.env && Boolean(this.env.secret)) || null, []]
    });
  }
}
