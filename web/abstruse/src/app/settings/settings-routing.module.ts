import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'integrations' },
  { path: 'integrations', component: SettingsIntegrationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
