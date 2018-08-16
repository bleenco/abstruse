import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuildsRoutingModule } from './builds-routing.module';
import { SharedModule } from '../shared/modules/shared.module';

import { BuildService } from './shared/build.service';

import { BuildsComponent } from './builds.component';
import { BuildsLatestComponent } from './builds-latest/builds-latest.component';
import { BuildItemComponent } from './build-item/build-item.component';
import { BuildDetailsComponent } from './build-details/build-details.component';
import { BuildJobItemComponent } from './build-job-item/build-job-item.component';

@NgModule({
  imports: [
    CommonModule,
    BuildsRoutingModule,
    SharedModule
  ],
  declarations: [
    BuildsComponent,
    BuildsLatestComponent,
    BuildItemComponent,
    BuildDetailsComponent,
    BuildJobItemComponent
  ],
  providers: [BuildService]
})
export class BuildsModule { }
