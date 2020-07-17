import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers/workers.component';
import { WorkerListItemComponent } from './worker-list-item/worker-list-item.component';
import { SharedModule } from '../shared';

@NgModule({
  imports: [CommonModule, WorkersRoutingModule, SharedModule],
  declarations: [WorkersComponent, WorkerListItemComponent]
})
export class WorkersModule {}
