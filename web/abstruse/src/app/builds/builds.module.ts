import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildsRoutingModule } from './builds-routing.module';
import { BuildsComponent } from './builds/builds.component';
import { SharedModule } from '../shared';
import { BuildListItemComponent } from './build-list-item/build-list-item.component';
import { BuildComponent } from './build/build.component';
import { JobListItemComponent } from './job-list-item/job-list-item.component';
import { JobComponent } from './job/job.component';

@NgModule({
  declarations: [BuildsComponent, BuildListItemComponent, BuildComponent, JobListItemComponent, JobComponent],
  imports: [CommonModule, BuildsRoutingModule, SharedModule]
})
export class BuildsModule {}
