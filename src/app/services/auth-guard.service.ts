import { Injectable, Provider } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    return combineLatest(...[
      this.apiService.isAppReady(),
      of(this.authService.isLoggedIn()),
      this.apiService.loginRequired()
    ])
    .pipe(
      map(([ready, loggedIn, loginRequired]) => {
        if (!loginRequired) {
          return true;
        } else {
          if (!ready) {
            this.router.navigate(['/setup']);
            return false;
          } else if (ready && !loggedIn) {
            this.router.navigate(['/login']);
            return false;
          } else if (ready && loggedIn) {
            return true;
          }
        }
      })
    );
  }
}

export const AuthGuardProvider: Provider = {
  provide: AuthGuard, useClass: AuthGuard
};
