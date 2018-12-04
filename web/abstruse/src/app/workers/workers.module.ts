import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers.component';
import { WorkersListComponent } from './workers-list/workers-list.component';
import { SharedModule } from '../shared/modules/shared.module';
import { WorkersEditDialogComponent } from './workers-edit-dialog/workers-edit-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    WorkersRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    WorkersComponent,
    WorkersListComponent,
    WorkersEditDialogComponent
  ]
})
export class WorkersModule { }
