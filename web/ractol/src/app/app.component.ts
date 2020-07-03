import { Component } from '@angular/core';
import { AuthService } from './shared/providers/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  auth$: Observable<boolean>;

  constructor(private auth: AuthService) {
    this.auth$ = this.auth.authenticated$.asObservable();
  }
}
