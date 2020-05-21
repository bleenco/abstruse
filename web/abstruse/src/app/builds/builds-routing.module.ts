import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildsComponent } from './builds.component';
import { BuildsRepoComponent } from './builds-repo/builds-repo.component';
import { BuildsHistoryComponent } from './builds-history/builds-history.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';
import { BuildsListComponent } from './builds-list/builds-list.component';

// const routes: Routes = [
//   {
//     path: '',
//     pathMatch: 'full',
//     component: BuildsComponent,
//     children: [
//       {
//         path: ':repoid',
//         component: BuildsRepoComponent,
//         children: [
//           { path: '', component: BuildsHistoryComponent, pathMatch: 'full' },
//           { path: ':buildid', component: BuildsDetailsComponent },
//           { path: ':buildid/:jobid', component: BuildsJobDetailsComponent }
//         ]
//       }
//     ]
//   }
// ];

const routes: Routes = [
  { path: '', pathMatch: 'full', component: BuildsListComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuildsRoutingModule { }
