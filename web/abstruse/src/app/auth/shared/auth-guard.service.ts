import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlSegment, CanLoad } from '@angular/router';
import { AuthService } from './auth.service';
import { Route } from '@angular/compiler/src/core';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate, CanLoad {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.authGuard();
  }

  canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    return this.authGuard();
  }

  private async authGuard(): Promise<boolean> {
    if (!!this.auth.userData) {
      if (this.auth.tokenExpiry() < Date.now()) {
        return this.auth
          .logoutRequest()
          .toPromise()
          .then(() => false)
          .catch(() => false);
      } else {
        return Promise.resolve(true);
      }
    }

    return Promise.resolve()
      .then(() => this.router.navigate(['/login']))
      .then(() => false);
  }
}
