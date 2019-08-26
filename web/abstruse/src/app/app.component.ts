import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatusService } from './shared/providers/status.service';
import { AuthService } from './shared/providers/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  authSub: Subscription;

  constructor(
    public statusService: StatusService,
    public authService: AuthService,
    public cookieService: CookieService
  ) { }

  ngOnInit() {
    this.statusService.checkStatus();
    this.authService.checkAuthenticated();

    this.authSub = this.authService.isLoggedIn.subscribe(status => {
      if (status) {
        this.cookieService.set('abstruse-auth-token', this.authService.getToken());
      } else {
        this.cookieService.delete('abstruse-auth-token');
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
