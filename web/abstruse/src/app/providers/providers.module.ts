import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersRoutingModule } from './providers-routing.module';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { ProvidersModalComponent } from './providers-modal/providers-modal.component';
import { SharedModule } from '../shared';
import { ProvidersListItemComponent } from './providers-list-item/providers-list-item.component';

@NgModule({
  declarations: [ProvidersListComponent, ProvidersModalComponent, ProvidersListItemComponent],
  imports: [CommonModule, ProvidersRoutingModule, SharedModule],
  entryComponents: [ProvidersModalComponent]
})
export class ProvidersModule {}
