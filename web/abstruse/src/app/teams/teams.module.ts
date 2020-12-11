import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsRoutingModule } from './teams-routing.module';
import { SharedModule } from '../shared';
import { TeamModalComponent } from './team-modal/team-modal.component';
import { UsersComponent } from './users/users.component';
import { UserListItemComponent } from './user-list-item/user-list-item.component';
import { UserModalComponent } from './user-modal/user-modal.component';
import { TeamItemComponent } from './team-item/team-item.component';
import { TeamsListComponent } from './teams-list/teams-list.component';

@NgModule({
  declarations: [
    TeamItemComponent,
    TeamModalComponent,
    UsersComponent,
    UserListItemComponent,
    UserModalComponent,
    TeamsListComponent
  ],
  imports: [CommonModule, TeamsRoutingModule, SharedModule],
  entryComponents: [TeamModalComponent, UserModalComponent]
})
export class TeamsModule {}
