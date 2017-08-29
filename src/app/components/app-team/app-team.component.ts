import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-team',
  templateUrl: 'app-team.component.html'
})
export class AppTeamComponent implements OnInit {
  error: boolean;
  success: boolean;
  loading: boolean;
  addUser: boolean;
  users: any[];
  user: any;
  password: string;
  password2: string;
  fullname: string;
  email: string;
  admin: boolean;

  constructor(private api: ApiService, private auth: AuthService) {
    this.loading = true;
    this.addUser = false;
    this.users = [];
    this.user = auth.getData();
    console.log(this.user);
  }

  ngOnInit() {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.api.getUsers().subscribe(event => {
      this.users = event;
      this.loading = false;
    });
  }

  showAddUser(): void {
    this.addUser = !this.addUser;
  }

  addNewUser(e: Event) {
    e.preventDefault();

    this.auth.addNewUser({
      email: this.email,
      fullname: this.fullname,
      password: this.password,
      confirmPassword: this.password2,
      admin: this.admin })
    .then(res => {
      if (res) {
        this.success = true;
        this.error = false;
        this.fetch();
        setTimeout(() => this.success = false, 5000);
        this.addUser = false;
      } else {
        this.error = true;
        this.success = false;
      }
    });
  }
}
