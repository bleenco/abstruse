import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeChartModule } from 'ngx-graph';
import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers.component';
import { WorkersListComponent } from './workers-list/workers-list.component';
import { WorkersListItemComponent } from './workers-list-item/workers-list-item.component';
import { SharedModule } from '../shared/shared.module';
import { WorkersModalComponent } from './workers-modal/workers-modal.component';

@NgModule({
  declarations: [
    WorkersComponent,
    WorkersListComponent,
    WorkersListItemComponent,
    WorkersModalComponent
  ],
  imports: [
    CommonModule,
    WorkersRoutingModule,
    RealtimeChartModule,
    SharedModule.forRoot()
  ],
  entryComponents: [WorkersModalComponent]
})
export class WorkersModule { }
