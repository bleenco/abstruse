import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  tab: 'team' | 'permissions';
  fetchingTeam: boolean;
  userTypes: { value: boolean, placeholder: string }[];

  constructor(public http: HttpClient) {
    this.userTypes = [
      { value: false, placeholder: 'User' },
      { value: true, placeholder: 'Administrator' }
    ];
  }

  switchTab(tab: 'team' | 'permissions'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;
  }
}
