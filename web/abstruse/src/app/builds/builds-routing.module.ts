import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildsComponent } from './builds.component';
import { BuildsRepoComponent } from './builds-repo/builds-repo.component';
import { BuildsHistoryComponent } from './builds-history/builds-history.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';

const routes: Routes = [
  {
    path: '',
    component: BuildsComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: '/' },
      {
        path: ':repoid',
        component: BuildsRepoComponent,
        children: [
          { path: '', component: BuildsHistoryComponent, pathMatch: 'full' },
          { path: ':buildid', component: BuildsDetailsComponent },
          { path: ':buildid/:jobid', component: BuildsJobDetailsComponent }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule { }
