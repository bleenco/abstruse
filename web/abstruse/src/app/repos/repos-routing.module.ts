import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReposComponent } from './repos/repos.component';
import { RepoComponent } from './repo/repo.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ReposComponent },
  { path: ':id', component: RepoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReposRoutingModule {}
