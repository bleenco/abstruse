import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlSegment, CanLoad } from '@angular/router';
import { AuthService } from './auth.service';
import { Route } from '@angular/compiler/src/core';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate, CanLoad {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.authGuard();
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean {
    return this.authGuard();
  }

  private authGuard(): boolean {
    if (!!this.auth.userData) {
      if (this.auth.tokenExpiry() < Date.now()) {
        this.auth.logout();
        return false;
      } else {
        return true;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
}
