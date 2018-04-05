import { Injectable, Provider } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
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
