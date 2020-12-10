import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploaderOptions, UploadFile, UploadInput, UploadOutput, UploadStatus } from 'ngx-uploader';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { User } from '../shared/user.model';
import { UsersService } from '../shared/users.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { equalValidator } from 'src/app/shared';

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

  onSubmit(): void {}

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
      password: [null, []],
      repeatPassword: [null, []]
    });

    this.form.controls.repeatPassword.setValidators([equalValidator(this.form.controls.password)]);
  }
}
