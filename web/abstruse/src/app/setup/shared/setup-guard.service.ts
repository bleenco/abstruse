import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SetupService } from './setup.service';

@Injectable({ providedIn: 'root' })
export class SetupGuardService implements CanActivate {
  constructor(private setup: SetupService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const ready = await this.setup.ready();
      if (ready) {
        return true;
      } else {
        this.router.navigate(['/setup']);
        return false;
      }
    } catch (e) {
      throw e;
    }
  }
}
