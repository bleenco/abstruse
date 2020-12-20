import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput, UploadStatus } from 'ngx-uploader';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { User } from '../shared/user.model';
import { UsersService } from '../shared/users.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { equalValidator } from 'src/app/shared';
import { finalize } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.sass']
})
export class UserModalComponent implements OnInit {
  user!: User;
  saving = false;
  error: string | null = null;
  form!: FormGroup;

  roleList = [
    { value: 'admin', placeholder: 'Admin' },
    { value: 'user', placeholder: 'User' }
  ];

  files: UploadFile[] = [];
  uploadInput: EventEmitter<UploadInput> = new EventEmitter<UploadInput>();
  uploadOptions: UploaderOptions = {
    concurrency: 1,
    maxFileSize: 3000000,
    allowedContentTypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
  };
  uploadUrl = `${environment.apiURL}/users/avatar`;
  uploadingAvatar = false;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private auth: AuthService,
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
      name: this.form.controls.name.value,
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
      avatar: this.form.controls.avatar.value,
      role: this.form.controls.role.value
    };
    if (this.user && this.user.id) {
      data = { ...data, ...{ id: this.user.id } };
    }

    if (data.id) {
      this.usersService
        .update(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          resp => {
            if (this.auth.data && this.auth.data.id === data.id) {
              this.auth.setToken(resp.token);
            }
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    } else {
      this.usersService
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

  onUploadOutput(output: UploadOutput): void {
    if (output.type === 'allAddedToQueue') {
      const event: UploadInput = {
        type: 'uploadAll',
        url: this.uploadUrl,
        method: 'POST',
        fieldName: 'file',
        headers: { Authorization: `Bearer ${this.auth.token}` }
      };
      this.uploadInput.emit(event);
      this.uploadingAvatar = true;
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') {
      this.files.push(output.file);
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'cancelled' || output.type === 'removed') {
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'done') {
      this.files = this.files.filter(file => file.progress.status !== UploadStatus.Done);
      this.form.patchValue({ avatar: output.file?.response });
      this.form.markAsDirty();
      this.uploadingAvatar = false;
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [(this.user && this.user.id) || null, []],
      email: [(this.user && this.user.email) || null, [Validators.required, Validators.email]],
      name: [(this.user && this.user.name) || null, [Validators.required]],
      role: [(this.user && this.user.role) || 'user', [Validators.required]],
      avatar: [(this.user && this.user.avatar) || '/assets/images/avatars/avatar_7.svg', [Validators.required]],
      password: [null, []],
      repeatPassword: [null, []]
    });

    this.form.controls.repeatPassword.setValidators([equalValidator(this.form.controls.password)]);
  }
}
