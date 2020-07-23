import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { equalValidator } from '../../shared';
import { ProfileService } from '../shared/profile.service';
import { Password } from '../shared/password.model';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.sass']
})
export class SecurityComponent implements OnInit {
  form!: FormGroup;
  saving: boolean = false;
  ok: boolean = false;
  error!: string | null;

  constructor(private fb: FormBuilder, private profile: ProfileService) {
    this.createForm();
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.error = null;
    this.ok = false;

    if (!this.form.valid) {
      return;
    }

    this.saving = true;
    const form: Password = {
      currentPassword: this.form.controls.currentPassword.value,
      newPassword: this.form.controls.password.value
    };

    this.profile
      .updatePassword(form)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.form.reset();
        }),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.ok = true;
        },
        err => {
          this.error = err.message;
        }
      );
  }

  private createForm(): void {
    this.form = this.fb.group({
      currentPassword: [null, [Validators.required, Validators.minLength(8)]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      repeatPassword: [null, [Validators.required]]
    });

    this.form.controls.repeatPassword.setValidators([
      Validators.required,
      Validators.minLength(8),
      equalValidator(this.form.controls.password)
    ]);
  }
}
