import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  { path: 'users', component: UsersComponent },
  { path: 'list', component: TeamsListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamsRoutingModule {}
