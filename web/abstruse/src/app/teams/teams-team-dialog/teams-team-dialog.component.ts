import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TeamsService } from '../shared/teams.service';

export class TeamForm {
  constructor(
    public id: number = null,
    public title: string = '',
    public description: string = '',
    public color: string = 'rgba(246,171,47,1)'
  ) { }
}

@Component({
  selector: 'app-teams-team-dialog',
  templateUrl: './teams-team-dialog.component.html',
  styleUrls: ['./teams-team-dialog.component.sass']
})
export class TeamsTeamDialogComponent implements OnInit {
  @Output() teamSaved: EventEmitter<void>;

  tab: 'general' | 'users' | 'permissions' | 'danger_zone';
  fetchingTeams: boolean;
  teamForm: TeamForm = new TeamForm();
  savingTeam: boolean;
  errorSavingTeam: string | any;
  predefinedPermissions: any[] = [];
  fetchingPredefinedPermissions: boolean;
  errorFetchingPredefinedPermissions: string | any;

  constructor(
    public teamsService: TeamsService
  ) {
    this.teamSaved = new EventEmitter<void>();
  }

  ngOnInit() {
    this.tab = 'general';
    this.predefinedPermissions = [];
    if (this.teamsService && this.teamsService.team) {
      const t = this.teamsService.team;
      this.teamForm = new TeamForm(t.id, t.title, t.description, t.color);
    }
  }

  switchTab(tab: 'general' | 'users' | 'permissions' | 'danger_zone'): void {
    if (this.tab === tab) {
      return;
    }
    this.tab = tab;

    if (this.tab === 'permissions') {
      this.fetchPredefinedPermissions();
    }
  }

  saveTeam(): void {
    this.savingTeam = true;
    this.teamsService.saveTeam(this.teamForm).subscribe(resp => {
      if (resp && resp.data) {
        this.teamSaved.emit();
        this.teamsService.closeTeamDialog();
      }
    }, err => {
      this.errorSavingTeam = err;
    }, () => this.savingTeam = true);
  }

  fetchPredefinedPermissions(): void {
    this.errorFetchingPredefinedPermissions = null;
    this.fetchingPredefinedPermissions = true;
    this.teamsService.fetchPredefinedPermissions(this.teamForm.id).subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.predefinedPermissions = resp.data;
      }
    }, err => {
      this.errorFetchingPredefinedPermissions = err;
    }, () => this.fetchingPredefinedPermissions = false);
  }

}
