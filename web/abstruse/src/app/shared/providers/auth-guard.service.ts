import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { getAPIURL } from '../../core/shared/shared-functions';
import { JSONResponse } from '../../core/shared/shared.model';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router, public http: HttpClient) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return Promise.resolve().then(() => {
      if (!this.auth.userInfo) {
        this.router.navigate(['/login']);
        return false;
      } else {
        return true;
      }
    });
  }
}
