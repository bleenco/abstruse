import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';
import { SettingsIntegrationDetailsComponent } from './settings-integration-details/settings-integration-details.component';
import { SettingsPersonalComponent } from './settings-personal/settings-personal.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'settings' },
  { path: 'personal', component: SettingsPersonalComponent },
  { path: 'integrations', component: SettingsIntegrationsComponent },
  { path: 'integrations/:id', component: SettingsIntegrationDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
