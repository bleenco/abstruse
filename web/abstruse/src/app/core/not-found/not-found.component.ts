import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.sass']
})
export class NotFoundComponent implements OnInit {
  loggedIn: Observable<boolean>;

  constructor(private auth: AuthService) {
    this.loggedIn = this.auth.authenticated.asObservable();
  }

  ngOnInit(): void {}
}
