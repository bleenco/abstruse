import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { ProvidersReposListComponent } from './providers-repos-list/providers-repos-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ProvidersListComponent },
  { path: ':id', component: ProvidersReposListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProvidersRoutingModule { }
