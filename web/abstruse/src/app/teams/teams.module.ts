import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { SharedModule } from '../shared/modules/shared.module';
import { TeamsTeamDialogComponent } from './teams-team-dialog/teams-team-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    TeamsRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    TeamsListComponent,
    TeamsTeamDialogComponent
  ]
})
export class TeamsModule { }
