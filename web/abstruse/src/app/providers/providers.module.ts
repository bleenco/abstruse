import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProvidersRoutingModule } from './providers-routing.module';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { SharedModule } from '../shared/shared.module';
import { ProvidersModalComponent } from './providers-modal/providers-modal.component';
import { ProvidersListItemComponent } from './providers-list-item/providers-list-item.component';


@NgModule({
  declarations: [
    ProvidersListComponent,
    ProvidersModalComponent,
    ProvidersListItemComponent
  ],
  imports: [
    CommonModule,
    ProvidersRoutingModule,
    SharedModule.forRoot()
  ],
  entryComponents: [ProvidersModalComponent]
})
export class ProvidersModule { }
