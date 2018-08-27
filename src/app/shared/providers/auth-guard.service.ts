import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { getAPIURL } from '../../core/shared/shared-functions';
import { JSONResponse } from '../../core/shared/shared.model';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router, public http: HttpClient) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return Promise.resolve()
      .then(() => this.loginRequired())
      .then(required => {
        if (required && !this.auth.userInfo) {
          this.router.navigate(['/login']);
          return false;
        } else {
          if (!this.auth.userInfo && !required) {
            this.auth.demo = true;
          }
          return true;
        }
      });
  }

  loginRequired(): Promise<boolean> {
    const url = getAPIURL() + '/setup/login-required';
    return this.http.get<JSONResponse>(url).toPromise().then(resp => resp.data);
  }
}
