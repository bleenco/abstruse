import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AlreadyAuthGuardService  {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.authGuard();
  }

  private authGuard(): boolean {
    if (!this.auth.data) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
