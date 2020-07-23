import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers/workers.component';
import { SharedModule } from '../shared';
import { WorkerTableItemComponent } from './worker-table-item/worker-table-item.component';

@NgModule({
  imports: [CommonModule, WorkersRoutingModule, SharedModule],
  declarations: [WorkersComponent, WorkerTableItemComponent]
})
export class WorkersModule {}
