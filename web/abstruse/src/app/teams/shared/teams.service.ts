import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAPIURL } from 'src/app/core/shared/shared-functions';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Observable } from 'rxjs';
import { Team } from './team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  teamDialogOpened: boolean;
  team: Team;

  constructor(
    public http: HttpClient
  ) { }

  openTeamDialog(team: Team | null): void {
    this.team = team;
    this.teamDialogOpened = true;
  }

  closeTeamDialog(): void {
    this.teamDialogOpened = false;
    this.team = null;
  }

  fetchTeams(): Observable<JSONResponse> {
    const url = getAPIURL() + '/teams';
    return this.http.get<JSONResponse>(url);
  }
}
