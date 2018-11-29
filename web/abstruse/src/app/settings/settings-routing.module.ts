import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsPersonalComponent } from './settings-personal/settings-personal.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'personal' },
  { path: 'personal', component: SettingsPersonalComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
