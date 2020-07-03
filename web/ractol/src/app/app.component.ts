import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/shared/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  auth$: Observable<boolean>;

  constructor(private auth: AuthService) {
    this.auth$ = this.auth.authenticated$.asObservable();
  }

  ngOnInit(): void {}
}
