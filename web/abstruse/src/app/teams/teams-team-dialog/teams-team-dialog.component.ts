import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TeamsService } from '../shared/teams.service';

export class TeamForm {
  constructor(
    public id: number = null,
    public title: string = '',
    public description: string = '',
    public color: string = 'rgba(246,171,47,1)',
    public users: any[] = [],
    public permissions: any[] = []
  ) { }
}

@Component({
  selector: 'app-teams-team-dialog',
  templateUrl: './teams-team-dialog.component.html',
  styleUrls: ['./teams-team-dialog.component.sass']
})
export class TeamsTeamDialogComponent implements OnInit {
  @Input() teamID: number;
  @Output() teamSaved: EventEmitter<void>;

  tab: 'general' | 'users' | 'permissions' | 'danger_zone';
  fetchingTeam: boolean;

  fetchingTeams: boolean;
  team: TeamForm = new TeamForm();
  savingTeam: boolean;
  errorSavingTeam: string | any;

  constructor(
    public teamsService: TeamsService
  ) {
    this.teamSaved = new EventEmitter<void>();
  }

  ngOnInit() {
    this.tab = 'general';

    this.team = new TeamForm();
    this.fetchTeam();
  }

  switchTab(tab: 'general' | 'users' | 'permissions' | 'danger_zone'): void {
    if (this.tab === tab) {
      return;
    }
    this.tab = tab;
  }

  saveTeam(): void {
    this.savingTeam = true;
    this.teamsService.saveTeam(this.team).subscribe(resp => {
      if (resp && resp.data) {
        this.teamSaved.emit();
        this.teamsService.closeTeamDialog();
      }
    }, err => {
      this.errorSavingTeam = err;
    }, () => this.savingTeam = true);
  }

  fetchTeam(): void {
    this.fetchingTeam = true;
    this.teamsService.fetchTeam(this.teamID).subscribe(resp => {
      if (resp && resp.data) {
        const t = resp.data;
        this.team = new TeamForm(t.id, t.title, t.description, t.color, t.users, t.permissions);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingTeam = false;
    });
  }

}
