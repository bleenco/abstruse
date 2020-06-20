import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../shared/providers/auth.service';
import { Login } from './login.model';
import { NgForm, NgModel } from '@angular/forms';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  @ViewChild('username', { static: false }) username: NgModel;
  @ViewChild('password', { static: false }) password: NgModel;
  @ViewChild('form', { read: NgForm }) form: NgForm;

  login: Login;
  loading: boolean;
  credentialsError: boolean;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.resetLogin();
    of({})
      .pipe(delay(50))
      .subscribe(() => this.updateForm());
  }

  doLogin(): void {
    this.loading = true;
    this.credentialsError = false;
    this.authService.authenticate(this.login).subscribe(
      resp => {
        if (!resp.data) {
          this.credentialsError = true;
          this.resetLogin();
        } else {
          this.authService.login(resp.data);
        }

        this.loading = false;
      },
      () => {
        this.credentialsError = true;
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  private updateForm(): void {
    this.form.resetForm();
  }

  private resetLogin(): void {
    this.login = new Login();
  }
}
