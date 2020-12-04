import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from '../shared/profile.service';
import { Profile, User } from '../../users/shared/user.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, switchMap, flatMap } from 'rxjs/operators';
import { AuthService } from '../../auth/shared/auth.service';
import { of } from 'rxjs';
import { UploadFile, UploadInput, UploaderOptions, UploadOutput, UploadStatus } from 'ngx-uploader';
import { environment } from 'src/environments/environment';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  saved = false;
  error: string | null = null;
  loading = false;

  files: UploadFile[] = [];
  uploadInput: EventEmitter<UploadInput> = new EventEmitter<UploadInput>();
  uploadOptions: UploaderOptions = {
    concurrency: 1,
    maxFileSize: 3000000,
    allowedContentTypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']
  };
  uploadUrl = `${environment.apiURL}/users/avatar`;
  uploadingAvatar = false;

  constructor(private fb: FormBuilder, private profile: ProfileService, private auth: AuthService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadProfile();
    this.form.valueChanges.pipe(untilDestroyed(this)).subscribe(() => (this.saved = false));
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.error = null;
    this.saving = true;
    this.saved = false;

    this.profile
      .updateProfile(this.generateModel())
      .pipe(
        finalize(() => (this.saving = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.updateValues(resp);
          this.form.markAsPristine();
          this.saved = true;
        },
        err => {
          this.error = err.message;
        }
      );
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

  private loadProfile(): void {
    this.loading = true;
    this.profile
      .findProfile()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.updateValues(resp);
        },
        err => {
          this.error = err.message;
        }
      );
  }

  private generateModel(): Profile {
    return new Profile(
      this.form.controls.email.value,
      this.form.controls.name.value,
      this.form.controls.avatar.value,
      this.form.controls.location.value
    );
  }

  private updateValues(user: User): void {
    this.form.patchValue({
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      location: user.location
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      name: [null, [Validators.required]],
      avatar: [null, [Validators.required]],
      location: [null, []]
    });
  }
}
