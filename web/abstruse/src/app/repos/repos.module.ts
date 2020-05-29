import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReposRoutingModule } from './repos-routing.module';
import { ReposListComponent } from './repos-list/repos-list.component';
import { SharedModule } from '../shared/shared.module';
import { ReposListItemComponent } from './repos-list-item/repos-list-item.component';

@NgModule({
  declarations: [
    ReposListComponent,
    ReposListItemComponent
  ],
  imports: [
    CommonModule,
    ReposRoutingModule,
    SharedModule.forRoot()
  ]
})
export class ReposModule { }
