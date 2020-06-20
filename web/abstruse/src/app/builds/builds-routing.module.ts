import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildsHistoryComponent } from './builds-history/builds-history.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';
import { BuildsRepoHistoryComponent } from './builds-repo-history/builds-repo-history.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: BuildsHistoryComponent },
  { path: ':repoid', component: BuildsRepoHistoryComponent },
  { path: ':repoid/:buildid', component: BuildsDetailsComponent },
  { path: ':repoid/:buildid/:jobid', component: BuildsJobDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule {}
