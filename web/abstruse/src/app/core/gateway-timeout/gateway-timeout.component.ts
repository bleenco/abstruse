import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/shared/auth.service';

@Component({
  selector: 'app-gateway-timeout',
  templateUrl: './gateway-timeout.component.html',
  styleUrls: ['./gateway-timeout.component.sass']
})
export class GatewayTimeoutComponent implements OnInit {
  loggedIn: Observable<boolean>;

  constructor(private auth: AuthService) {
    this.loggedIn = this.auth.authenticated.asObservable();
  }

  ngOnInit(): void {}
}
