import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/shared/auth.service';
import { Observable, Subscription } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SocketService } from './shared/providers/socket.service';
import { environment } from 'src/environments/environment';
import { Logger } from './core/shared/logger.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  loggedIn: Observable<boolean>;
  sub!: Subscription;
  logger = new Logger('websocket');

  constructor(private auth: AuthService, private socket: SocketService) {
    this.loggedIn = this.auth.authenticated.asObservable();
  }

  ngOnInit(): void {
    if (environment.production) {
      Logger.enableProductionMode();
    }

    this.loggedIn.pipe(untilDestroyed(this)).subscribe(loggedIn => {
      if (loggedIn) {
        this.sub = this.socket.onMessage().subscribe(ev => this.logger.debug(ev));
      } else if (this.sub) {
        this.sub.unsubscribe();
      }
    });
  }
}
