import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/shared/auth.service';
import { Observable } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { environment } from 'src/environments/environment';
import { Logger } from './core/shared/logger.service';
import { Router, NavigationStart } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  loggedIn: Observable<boolean>;
  logger = new Logger('websocket');

  constructor(private auth: AuthService) {
    this.loggedIn = this.auth.authenticated.asObservable().pipe(untilDestroyed(this));
  }

  ngOnInit(): void {
    if (environment.production) {
      Logger.enableProductionMode();
    }
  }
}
