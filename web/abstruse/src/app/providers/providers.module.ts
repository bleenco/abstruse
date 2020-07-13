import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersRoutingModule } from './providers-routing.module';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { ProvidersModalComponent } from './providers-modal/providers-modal.component';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [ProvidersListComponent, ProvidersModalComponent],
  imports: [CommonModule, ProvidersRoutingModule, SharedModule],
  entryComponents: [ProvidersModalComponent]
})
export class ProvidersModule {}
