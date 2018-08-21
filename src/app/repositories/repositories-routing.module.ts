import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RepositoriesComponent } from './repositories.component';

const repositoriesRoutes: Routes = [
  {
    path: '',
    component: RepositoriesComponent,
    children: [
      // { path: '', component: BuildsLatestComponent },
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
