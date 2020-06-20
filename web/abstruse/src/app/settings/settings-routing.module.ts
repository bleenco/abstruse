import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsUserComponent } from './settings-user/settings-user.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: SettingsUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
