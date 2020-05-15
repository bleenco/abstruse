import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkersRoutingModule } from './workers-routing.module';
import { WorkersComponent } from './workers.component';
import { WorkersListComponent } from './workers-list/workers-list.component';
import { WorkersListItemComponent } from './workers-list-item/workers-list-item.component';
import { SharedModule } from '../shared/shared.module';
import { WorkersService } from './shared/workers.service';

@NgModule({
  declarations: [
    WorkersComponent,
    WorkersListComponent,
    WorkersListItemComponent
  ],
  imports: [
    CommonModule,
    WorkersRoutingModule,
    SharedModule.forRoot()
  ]
})
export class WorkersModule { }
