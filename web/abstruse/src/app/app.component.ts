import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from './shared/providers/auth.service';
import { StatusService } from './shared/providers/status.service';
import { CookieService } from 'ngx-cookie-service';
import { ThemeService } from './shared/providers/theme.service';
import { SettingsService } from './shared/providers/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  authSub: Subscription;
  themeSub: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public renderer: Renderer2,
    public authService: AuthService,
    public statusService: StatusService,
    public cookieService: CookieService,
    public themeService: ThemeService,
    public settings: SettingsService
  ) {}

  ngOnInit(): void {
    this.settings.open();
    this.authService.checkAuthenticated();

    this.authSub = this.authService.isLoggedIn.subscribe(status => {
      if (status) {
        this.cookieService.set('abstruse-auth-token', this.authService.getToken());
      } else {
        this.cookieService.delete('abstruse-auth-token');
      }
    });

    this.themeSub = this.themeService.theme$.subscribe(theme => {
      const body = this.document.body;
      const remove = theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
      this.renderer.removeClass(body, remove);
      this.renderer.addClass(body, theme);
    });
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }
}
