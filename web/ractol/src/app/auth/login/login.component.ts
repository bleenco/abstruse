import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '../shared/auth.service';
import { finalize } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  error: string | undefined;
  loginForm!: FormGroup;
  isLoading = false;

  constructor(private fromBuilder: FormBuilder, private auth: AuthService) {
    this.createForm();
  }

  ngOnInit(): void {}

  login(): void {
    this.isLoading = true;
    this.auth
      .authenticate(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        creds => this.auth.login(creds, this.loginForm.controls.remember.value),
        error => (this.error = error)
      );
  }

  private createForm(): void {
    this.loginForm = this.fromBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      remember: true
    });
  }
}
