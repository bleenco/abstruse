import { Component, OnInit } from '@angular/core';
import { TeamsService } from '../shared/teams.service';

export class TeamForm {
  constructor(
    public id?: number,
    public title?: string,
    public description?: string,
    public color?: string
  ) { }
}

@Component({
  selector: 'app-teams-team-dialog',
  templateUrl: './teams-team-dialog.component.html',
  styleUrls: ['./teams-team-dialog.component.sass']
})
export class TeamsTeamDialogComponent implements OnInit {
  tab: 'general' | 'users' | 'permissions';
  fetchingTeams: boolean;
  teamForm: TeamForm = new TeamForm();

  constructor(
    public teamsService: TeamsService
  ) { }

  ngOnInit() {
    this.tab = 'general';
    if (this.teamsService && this.teamsService.team) {
      const t = this.teamsService.team;
      this.teamForm = new TeamForm(t.id, t.title, t.description, t.color);
    }
  }

  switchTab(tab: 'general' | 'users' | 'permissions'): void {
    if (this.tab === tab) {
      return;
    }

    this.tab = tab;
  }

}
