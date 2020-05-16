import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardIndexComponent } from './dashboard-index/dashboard-index.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: DashboardIndexComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
