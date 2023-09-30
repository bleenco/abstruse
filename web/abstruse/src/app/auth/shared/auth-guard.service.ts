import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService  {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.authGuard();
  }

  canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    return this.authGuard();
  }

  private async authGuard(): Promise<boolean> {
    const auth = this.auth.isAuthenticated;
    if (!auth) {
      this.router.navigate(['/login']);
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }
}
