import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepositoriesListComponent } from './repositories-list/repositories-list.component';
import { RepositoriesDetailsComponent } from './repositories-details/repositories-details.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: RepositoriesListComponent },
  { path: ':id', component: RepositoriesDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepositoriesRoutingModule { }
