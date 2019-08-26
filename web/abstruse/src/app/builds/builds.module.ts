import { NgModule } from '@angular/core';

import { BuildsRoutingModule } from './builds-routing.module';
import { SharedModule } from '../shared/modules/shared.module';
import { HighlightModule } from 'ngx-highlightjs';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';
import { BuildsListItemComponent } from './builds-list-item/builds-list-item.component';
import { BuildService } from './shared/build.service';
import { BuildsDetailsComponent } from './builds-details/builds-details.component';
import { BuildsJobListItemComponent } from './builds-job-list-item/builds-job-list-item.component';
import { BuildsJobDetailsComponent } from './builds-job-details/builds-job-details.component';
import { BuildsNavComponent } from './builds-nav/builds-nav.component';
import { BuildsInfoContainerComponent } from './builds-info-container/builds-info-container.component';

@NgModule({
  imports: [
    BuildsRoutingModule,
    SharedModule.forRoot(),
    HighlightModule
  ],
  declarations: [
    BuildsComponent,
    BuildsLatestComponent,
    BuildsListItemComponent,
    BuildsDetailsComponent,
    BuildsJobListItemComponent,
    BuildsJobDetailsComponent,
    BuildsNavComponent,
    BuildsInfoContainerComponent
  ],
  providers: [
    BuildService
  ],
  exports: [
    BuildsListItemComponent
  ]
})
export class BuildsModule { }
