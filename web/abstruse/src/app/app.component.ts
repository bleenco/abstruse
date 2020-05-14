import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './shared/providers/auth.service';
import { StatusService } from './shared/providers/status.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {
  authSub: Subscription;

  constructor(
    public authService: AuthService,
    public statusService: StatusService,
    public cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.authService.checkAuthenticated();

    this.authSub = this.authService.isLoggedIn.subscribe(status => {
      if (status) {
        this.cookieService.set('abstruse-auth-token', this.authService.getToken());
      } else {
        this.cookieService.delete('abstruse-auth-token');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }
}
