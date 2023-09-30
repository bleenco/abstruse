import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { MountVariable } from '../settings-mount/mount-variable.model';
import { ReposService } from '../shared/repos.service';

@UntilDestroy()
@Component({
  selector: 'app-settings-mount-modal',
  templateUrl: './settings-mount-modal.component.html',
  styleUrls: ['./settings-mount-modal.component.sass']
})
export class SettingsMountModalComponent implements OnInit {
  mount!: MountVariable;
  saving = false;
  checking = false;
  form!: UntypedFormGroup;
  error: string | null = null;
  deleting = false;

  constructor(
    private fb: UntypedFormBuilder,
    private reposService: ReposService,
    public activeModal: ActiveModal
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    this.error = null;
    this.saving = true;
    let data: any = {
      host: String(this.form.controls.host.value),
      container: String(this.form.controls.container.value)
    };
    if (this.mount && this.mount.id) {
      data = { ...data, ...{ id: Number(this.mount.id) } };
    }

    if (data.id) {
      this.reposService
        .updateMount(data)
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
        .createMount(data)
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
    if (!this.mount || !this.mount.id) {
      return;
    }

    this.deleting = true;
    this.reposService
      .deleteMount(this.mount)
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
      host: [(this.mount && this.mount.host) || null, [Validators.required]],
      container: [(this.mount && this.mount.container) || null, [Validators.required]],
    });
  }
}
