import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanLoad {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.userInfo) {
      return true;
    } else {
      this.router.navigate(['']);
      return false;
    }
  }

  canLoad(): boolean {
    if (this.auth.userInfo) {
      return true;
    } else {
      return false;
    }
  }
}
