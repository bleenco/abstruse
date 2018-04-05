import { Injectable, Provider } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return new Observable(observer => {
      let userData: any = this.authService.getData();
      const userId = userData && userData.id || null;

      if (route.url && route.url[0]) {
        switch (route.url[0].path) {
          case 'repo':
            this.apiService.getUserRepositoryPermission(route.params.id, userId)
            .pipe(map(permission => !!permission))
            .subscribe(permission => {
              if (!permission) {
                this.router.navigate(['/']);
              }

              observer.next(permission);
              observer.complete();
            });
          break;
          case 'build':
            this.apiService.getUserBuildPermission(route.params.id, userId)
            .pipe(map(permission => !!permission))
            .subscribe(permission => {
              if (!permission) {
                this.router.navigate(['/']);
              }

              observer.next(permission);
              observer.complete();
            });
          break;
          case 'job':
            this.apiService.getUserJobPermission(route.params.id, userId)
            .pipe(map(permission => !!permission))
            .subscribe(permission => {
              if (!permission) {
                this.router.navigate(['/']);
              }

              observer.next(permission);
              observer.complete();
            });
          break;
          default:
            this.router.navigate(['/']);

            observer.next(false);
            observer.complete();
          break;
        }
      } else {
        this.router.navigate(['/']);

        observer.next(false);
        observer.complete();
      }
    });
  }
}

export const AccessGuardProvider: Provider = {
  provide: AccessGuard, useClass: AccessGuard
};
