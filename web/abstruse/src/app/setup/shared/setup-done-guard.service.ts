import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SetupService } from './setup.service';

@Injectable({ providedIn: 'root' })
export class SetupDoneGuardService implements CanActivate {
  constructor(private setup: SetupService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const ready = await this.setup.ready();
      if (ready) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
}
