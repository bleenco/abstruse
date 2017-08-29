import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

export interface UserLogin {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: 'app-login.component.html'
})
export class AppLoginComponent implements OnInit {
  loading: boolean;
  user: UserLogin;
  required: boolean;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.loading = true;
    this.required = true;
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.user = { email: '', password: '' };
    this.apiService.isAppReady().subscribe(event => {
      this.loading = false;
      if (!event) {
        this.router.navigate(['/setup']);
      } else {
        this.apiService.loginRequired().subscribe(required => {
          this.authService.setLoginRequired(required);
          this.required = required;
        });
      }
    });
  }

  doLogin(): void {
    this.loading = true;
    this.apiService.login(this.user).delay(1000).subscribe(jwt => {
      if (jwt) {
        this.authService.login(jwt);
        this.router.navigate(['/']);
      } else {
        this.user = { email: '', password: '' };
        this.loading = false;
      }
    });
  }
}
