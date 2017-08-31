import { Injectable, Provider } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/combineLatest';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      let userData: any = this.authService.getData();
      if (route.url && route.url[0]) {
        if (route.url[0].path === 'repo') {
          return this.apiService.getUserRepositoryPermission(
            route.params.id, userData.id).toPromise()
            .then(permission => {
              if (!!permission) {
                resolve(!!permission);
              } else {
                this.router.navigate(['/']);
                resolve(false);
              }
            });
        } else if (route.url[0].path === 'build') {
          return this.apiService.getUserBuildPermission(route.params.id, userData.id).toPromise()
          .then(permission => {
            if (!!permission) {
              resolve(!!permission);
            } else {
              this.router.navigate(['/']);
              resolve(false);
            }
          });
        } else if (route.url[0].path === 'job') {
          return this.apiService.getUserJobPermission(route.params.id, userData.id).toPromise()
            .then(permission => {
              if (!!permission) {
                resolve(!!permission);
              } else {
                this.router.navigate(['/']);
                resolve(false);
              }
            });
         }
      } else {
        this.router.navigate(['/']);
        resolve(false);
      }
    });
  }
}

export const AccessGuardProvider: Provider = {
  provide: AccessGuard, useClass: AccessGuard
};
