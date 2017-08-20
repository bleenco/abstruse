import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

export interface IUser {
  id: number;
  email: string;
  fullname: string;
  admin: boolean;
  avatar: string;
}

export interface IUserPass {
  id: number;
  password: string;
  repeat_password;
}

export interface IAccessToken {
  token: string;
  description: string;
  users_id: number;
}

@Component({
  selector: 'app-settings',
  templateUrl: 'app-settings.component.html'
})
export class AppSettingsComponent implements OnInit {
  loading: boolean;
  userSaved: boolean;
  user: IUser;
  userPasswordSaved: boolean;
  userPass: IUserPass;
  avatarUrl: string;
  token: IAccessToken;
  tokens: IAccessToken[];

  constructor(private api: ApiService, private auth: AuthService, private config: ConfigService) {
    this.loading = true;
  }

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser(): void {
    this.loading = true;
    const user: any = this.auth.getData();
    this.api.getUser(user.id).subscribe(data => {
      this.user = {
        id: data.id,
        email: data.email,
        fullname: data.fullname,
        admin: data.admin,
        avatar: data.avatar
      };
      this.userPass = { id: data.id, password: '', repeat_password: '' };
      this.avatarUrl = this.config.url + data.avatar;
      this.token = { token: '', description: '', users_id: data.id };
      this.tokens = data.access_tokens;

      this.loading = false;
    });
  }

  updateProfile(e: MouseEvent): void {
    e.preventDefault();

    this.api.updateUser(this.user).subscribe(event => {
      if (event) {
        this.userSaved = true;
        setTimeout(() => this.userSaved = false, 3000);
      }
    });
  }

  updatePassword(e: MouseEvent): void {
    e.preventDefault();

    this.api.updatePassword(this.userPass).subscribe(event => {
      if (event) {
        this.userPasswordSaved = true;
        setTimeout(() => this.userPasswordSaved = false, 3000);
        this.userPass.password = '';
        this.userPass.repeat_password = '';
      }
    });
  }

  addToken(e: MouseEvent): void {
    e.preventDefault();

    this.api.addToken(this.token).subscribe(event => {
      if (event) {
        this.fetchUser();
      }
    });
  }
}
