import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntegrationsListComponent } from './integrations-list/integrations-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: IntegrationsListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IntegrationsRoutingModule { }
