import { Injectable, Provider } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/combineLatest';

@Injectable()
export class AuthGuard implements CanActivate {
  jwtHelper: JwtHelper;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.jwtHelper = new JwtHelper();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return Observable.combineLatest(...[
      this.apiService.isAppReady(),
      Observable.of(this.authService.isLoggedIn())
    ])
    .map(([ready, loggedIn]) => {
      if (!ready && !loggedIn) {
        this.router.navigate(['/setup']);
        return false;
      } else if (ready && !loggedIn) {
        this.router.navigate(['/login']);
        return false;
      } else {
        return true;
      }
    });
  }
}

export const AuthGuardProvider: Provider = {
  provide: AuthGuard, useClass: AuthGuard
};
