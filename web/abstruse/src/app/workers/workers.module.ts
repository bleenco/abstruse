import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers/workers.component';
import { SharedModule } from '../shared';
import { WorkerTableItemComponent } from './worker-table-item/worker-table-item.component';
import { WorkerModalComponent } from './worker-modal/worker-modal.component';
import { RealtimeCanvasChartModule } from 'ngx-graph';

@NgModule({
  imports: [CommonModule, WorkersRoutingModule, SharedModule, RealtimeCanvasChartModule],
  declarations: [WorkersComponent, WorkerTableItemComponent, WorkerModalComponent]
})
export class WorkersModule {}
