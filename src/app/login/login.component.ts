import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/providers/auth.service';
import { Login } from './login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  login: Login;
  loading: boolean;
  credentialsError: boolean;

  constructor(public authService: AuthService) { }

  ngOnInit() {
    this.resetLogin();
  }

  doLogin(): void {
    this.loading = true;
    this.credentialsError = false;
    this.authService.authenticate(this.login).subscribe(resp => {
      if (!resp.data) {
        this.credentialsError = true;
        this.resetLogin();
      } else {
        this.authService.login(resp.data);
      }

      this.loading = false;
    });
  }

  private resetLogin(): void {
    this.login = new Login();
  }
}
