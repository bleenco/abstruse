import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RepositoriesComponent } from './repositories.component';
import { RepositoriesListComponent } from './repositories-list/repositories-list.component';
import { RepositoriesRepoDetailsComponent } from './repositories-repo-details/repositories-repo-details.component';

const repositoriesRoutes: Routes = [
  {
    path: '',
    component: RepositoriesComponent,
    children: [
      { path: '', component: RepositoriesListComponent },
      { path: ':id', component: RepositoriesRepoDetailsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(repositoriesRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class RepositoriesRoutingModule { }
