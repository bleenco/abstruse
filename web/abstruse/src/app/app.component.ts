import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth/shared/auth.service';
import { Observable, Subscription } from 'rxjs';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { DataService } from './shared/providers/data.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  loggedIn: Observable<boolean>;
  sub = new Subscription();

  constructor(private auth: AuthService, private dataService: DataService) {
    this.loggedIn = this.auth.authenticated.asObservable().pipe(untilDestroyed(this));
  }

  ngOnInit(): void {
    this.loggedIn.pipe(untilDestroyed(this)).subscribe(loggedIn => {
      if (loggedIn) {
        this.sub = new Subscription();
        this.sub.add(this.dataService.socketOutput.subscribe());
      } else {
        this.sub.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
