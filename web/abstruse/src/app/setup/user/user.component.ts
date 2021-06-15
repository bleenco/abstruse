import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { equalValidator, randomInt } from '../../shared';
import { generateAdminModel, Admin } from '../shared/admin.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SetupService } from '../shared/setup.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit {
  userForm!: FormGroup;
  submitted = false;
  saved = false;
  saving = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private setup: SetupService, private router: Router) {
    this.createForm();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.error = null;
    this.submitted = true;
    if (!this.userForm.valid) {
      return;
    }

    this.saving = true;
    const form = this.createModel();
    this.setup
      .saveUser(form)
      .pipe(
        finalize(() => (this.saving = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.router.navigate(['/login']);
        },
        err => {
          this.resetValues();
          this.error = err.message;
        }
      );
  }

  resetValues(): void {
    this.userForm.patchValue({
      email: '',
      login: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: 'admin'
    });
    this.userForm.markAsPristine();
  }

  private createModel(): Admin {
    const data = {
      email: this.userForm.controls.email.value,
      login: this.userForm.controls.login.value,
      name: this.userForm.controls.name.value,
      password: this.userForm.controls.password.value,
      avatar: this.userForm.controls.avatar.value
    };

    return generateAdminModel(data);
  }

  private createForm(): void {
    this.userForm = this.fb.group({
      avatar: [`/assets/images/avatars/avatar_${randomInt(1, 30)}.svg`, [Validators.required]],
      login: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required]],
      name: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null],
      role: ['admin']
    });

    this.userForm.controls.confirmPassword.setValidators([
      Validators.required,
      Validators.minLength(8),
      equalValidator(this.userForm.controls.password)
    ]);
  }
}
