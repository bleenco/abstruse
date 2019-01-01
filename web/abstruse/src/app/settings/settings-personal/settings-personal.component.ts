import { Component, OnInit } from '@angular/core';
import { User } from '../shared/user.model';
import { PersonalService } from '../shared/personal.service';

@Component({
  selector: 'app-settings-personal',
  templateUrl: './settings-personal.component.html',
  styleUrls: ['./settings-personal.component.sass']
})
export class SettingsPersonalComponent implements OnInit {
  user: User;
  fetchingPersonalInfo: boolean;

  constructor(public personalService: PersonalService) { }

  ngOnInit() {
    this.fetchPersonalInfo();
  }

  fetchPersonalInfo(): void {
    this.fetchingPersonalInfo = true;
    this.personalService.fetchPersonalInfo().subscribe(resp => {
      if (resp && resp.data) {
        const user = resp.data;
        this.user = new User(user.id, user.email, user.fullname, user.avatar, user.totp_enabled, user.totp_account_name);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingPersonalInfo = false;
    });
  }

}
