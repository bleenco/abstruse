import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReposComponent } from './repos/repos.component';
import { RepoComponent } from './repo/repo.component';
import { SettingsComponent } from './settings/settings.component';
import { BuildsComponent } from './builds/builds.component';
import { BranchesComponent } from './branches/branches.component';
import { PullRequestsComponent } from './pull-requests/pull-requests.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ReposComponent },
  {
    path: ':id',
    component: RepoComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'builds' },
      { path: 'builds', component: BuildsComponent },
      { path: 'branches', component: BranchesComponent },
      { path: 'pull-requests', component: PullRequestsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReposRoutingModule {}
