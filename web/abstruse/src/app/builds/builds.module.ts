import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsHistoryComponent } from './builds-history/builds-history.component';
import { BuildsRepoComponent } from './builds-repo/builds-repo.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';
import { BuildsComponent } from './builds.component';
import { SharedModule } from '../shared/shared.module';
import { BuildsService } from './shared/builds.service';
import { BuildsListItemComponent } from './builds-list-item/builds-list-item.component';

@NgModule({
  declarations: [
    BuildsComponent,
    BuildsHistoryComponent,
    BuildsRepoComponent,
    BuildsDetailsComponent,
    BuildsJobDetailsComponent,
    BuildsListItemComponent
  ],
  imports: [
    CommonModule,
    BuildsRoutingModule,
    SharedModule.forRoot()
  ],
  providers: [
    BuildsService
  ]
})
export class BuildsModule { }
