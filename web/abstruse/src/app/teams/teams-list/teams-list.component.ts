import { Component, OnInit } from '@angular/core';
import { TeamsService } from '../shared/teams.service';
import { Team } from '../shared/team.model';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.sass']
})
export class TeamsListComponent implements OnInit {
  fetchingTeams: boolean;
  errorFetchingTeams: string | any;
  teams: Team[] = [];
  teamID: number;

  constructor(
    public teamsService: TeamsService
  ) { }

  ngOnInit() {
    this.fetchTeams();
  }

  teamSavedEvent(): void {
    this.fetchTeams();
  }

  fetchTeams(): void {
    this.fetchingTeams = true;
    this.teamsService.fetchTeams().subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.teams = resp.data.map(d => {
          return new Team(d.id, d.title, d.description, d.color, d.is_deletable, d.users, d.permissions);
        });
      }
    }, err => {
      this.errorFetchingTeams = (((err || {}).error || {}).error || {}).message || JSON.stringify(err);
    }, () => this.fetchingTeams = false);
  }

  openDialog(teamID: number): void {
    this.teamID = teamID;
    this.teamsService.openTeamDialog();
  }
}
