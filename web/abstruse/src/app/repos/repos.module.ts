import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReposRoutingModule } from './repos-routing.module';
import { ReposListComponent } from './repos-list/repos-list.component';

@NgModule({
  declarations: [
    ReposListComponent
  ],
  imports: [
    CommonModule,
    ReposRoutingModule
  ]
})
export class ReposModule { }
