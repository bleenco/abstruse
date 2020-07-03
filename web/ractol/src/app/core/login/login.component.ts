import { Component, OnInit } from '@angular/core';
import { Login } from './login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
  form: Login = { email: '', password: '' };

  constructor() {}

  ngOnInit(): void {}
}
