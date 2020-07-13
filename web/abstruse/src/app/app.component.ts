import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/shared/auth.service';
import { Observable, Subscription } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SocketService } from './shared/providers/socket.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  loggedIn: Observable<boolean>;
  sub = new Subscription();

  constructor(private auth: AuthService, private socket: SocketService) {
    this.loggedIn = this.auth.authenticated.asObservable();
  }

  ngOnInit(): void {
    this.loggedIn.pipe(untilDestroyed(this)).subscribe(loggedIn => {
      if (loggedIn) {
        const sub = this.socket.onMessage().subscribe(ev => console.log(ev));
        this.sub.add(sub);
      } else {
        this.sub.unsubscribe();
      }
    });
  }
}
