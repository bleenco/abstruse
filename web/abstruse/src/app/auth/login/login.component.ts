import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '../shared/auth.service';
import { finalize } from 'rxjs/operators';
import { SetupService } from 'src/app/setup/shared/setup.service';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  displayForm: boolean = false;
  error: string | undefined;
  loginForm!: FormGroup;
  isLoading = false;
  submitted = false;

  constructor(
    private fromBuilder: FormBuilder,
    private auth: AuthService,
    private setup: SetupService,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.setup.ready().then(ready => (!!ready ? (this.displayForm = true) : this.router.navigate(['/setup'])));
  }

  login(): void {
    this.submitted = true;
    this.error = undefined;
    if (!this.loginForm.valid) {
      return;
    }

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
        tokens => this.auth.login(tokens),
        error => (this.error = error.message)
      );
  }

  private createForm(): void {
    this.loginForm = this.fromBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
}
