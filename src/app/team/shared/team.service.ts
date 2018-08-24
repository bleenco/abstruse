import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAPIURL, handleError, getAvatars } from '../../core/shared/shared-functions';
import { JSONResponse } from '../../core/shared/shared.model';
import { catchError } from 'rxjs/operators';
import { User } from './team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  tab: 'team' | 'permissions';
  fetchingTeam: boolean;
  userTypes: { value: boolean, placeholder: string }[];
  team: User[] = [];
  user: User;
  avatars: string[];
  userDialogType: 'add' | 'edit';
  userDialogOpened: boolean;
  userDialogSaving: boolean;

  constructor(public http: HttpClient) {
    this.userTypes = [
      { value: false, placeholder: 'User' },
      { value: true, placeholder: 'Administrator' }
    ];
    this.avatars = getAvatars();
  }

  switchTab(tab: 'team' | 'permissions'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;

    if (this.tab === 'team') {
      this.fetchTeam();
    }
  }

  fetchTeam(): void {
    this.fetchingTeam = true;
    const url = getAPIURL() + `/team`;

    this.http.get<JSONResponse>(url)
      .pipe(
        catchError(handleError<JSONResponse>('team'))
      )
      .subscribe(resp => {
        if (resp && resp.data) {
          this.team = resp.data.map(user => new User(user.email, user.fullname, user.avatar, Boolean(user.admin)));
        }

        this.fetchingTeam = false;
      });
  }

  openUserDialog(type: 'add' | 'edit', user: User = new User('', '', '', false)): void {
    this.userDialogType = type;
    this.user = user;
    this.userDialogOpened = true;
  }

  closeUserDialog(): void {
    this.userDialogType = null;
    this.user = null;
    this.userDialogOpened = false;
  }
}
