import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers.component';
import { WorkersListComponent } from './workers-list/workers-list.component';

@NgModule({
  declarations: [
    WorkersComponent,
    WorkersListComponent
  ],
  imports: [
    CommonModule,
    WorkersRoutingModule
  ]
})
export class WorkersModule { }
