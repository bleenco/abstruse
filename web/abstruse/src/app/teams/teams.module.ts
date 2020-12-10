import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsComponent } from './teams/teams.component';
import { SharedModule } from '../shared';
import { TeamListItemComponent } from './team-list-item/team-list-item.component';
import { TeamModalComponent } from './team-modal/team-modal.component';
import { TeamComponent } from './team/team.component';
import { UsersComponent } from './users/users.component';
import { UserListItemComponent } from './user-list-item/user-list-item.component';
import { UserModalComponent } from './user-modal/user-modal.component';

@NgModule({
  declarations: [
    TeamsComponent,
    TeamListItemComponent,
    TeamModalComponent,
    TeamComponent,
    UsersComponent,
    UserListItemComponent,
    UserModalComponent
  ],
  imports: [CommonModule, TeamsRoutingModule, SharedModule],
  entryComponents: [TeamModalComponent, UserModalComponent]
})
export class TeamsModule {}
