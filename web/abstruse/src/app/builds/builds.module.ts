import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsHistoryComponent } from './builds-history/builds-history.component';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';
import { SharedModule } from '../shared/shared.module';
import { BuildsService } from './shared/builds.service';
import { BuildsListItemComponent } from './builds-list-item/builds-list-item.component';
import { BuildsRepoHistoryComponent } from './builds-repo-history/builds-repo-history.component';
import { BuildsInfoContainerComponent } from './builds-info-container/builds-info-container.component';
import { BuildsJobListItemComponent } from './builds-job-list-item/builds-job-list-item.component';

@NgModule({
  declarations: [
    BuildsHistoryComponent,
    BuildsDetailsComponent,
    BuildsJobDetailsComponent,
    BuildsListItemComponent,
    BuildsRepoHistoryComponent,
    BuildsInfoContainerComponent,
    BuildsJobListItemComponent
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
