import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from '../shared/profile.service';
import { Profile, User } from '../../users/shared/user.model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, switchMap, flatMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  saving: boolean = false;
  saved: boolean = false;
  error: string | null = null;
  loading: boolean = false;

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
        switchMap(user => this.auth.refreshTokens().pipe(flatMap(() => of(user)))),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.updateValues(resp);
          this.form.markAsPristine();
          this.saved = true;
          this.auth.restartRefreshTimer();
        },
        err => {
          this.error = err.message;
        }
      );
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
