import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildsRoutingModule } from './builds-routing.module';
import { SharedModule } from '../shared';
import { BuildsCommonModule } from './common/builds-common.module';
import { BuildComponent } from './build/build.component';
import { JobListItemComponent } from './job-list-item/job-list-item.component';
import { JobComponent } from './job/job.component';
import { IndexComponent } from './index/index.component';

@NgModule({
  declarations: [BuildComponent, JobListItemComponent, JobComponent, IndexComponent],
  imports: [CommonModule, BuildsRoutingModule, SharedModule, BuildsCommonModule]
})
export class BuildsModule {}
