import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsComponent } from './teams/teams.component';
import { SharedModule } from '../shared';
import { TeamListItemComponent } from './team-list-item/team-list-item.component';
import { TeamModalComponent } from './team-modal/team-modal.component';

@NgModule({
  declarations: [TeamsComponent, TeamListItemComponent, TeamModalComponent],
  imports: [CommonModule, TeamsRoutingModule, SharedModule],
  entryComponents: [TeamModalComponent]
})
export class TeamsModule {}
