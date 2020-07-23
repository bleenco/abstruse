import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersRoutingModule } from './providers-routing.module';
import { SharedModule } from '../shared';
import { ProvidersComponent } from './providers/providers.component';
import { ProviderItemComponent } from './provider-item/provider-item.component';
import { ProvidersModalComponent } from './providers-modal/providers-modal.component';

@NgModule({
  declarations: [ProvidersModalComponent, ProvidersComponent, ProviderItemComponent],
  imports: [CommonModule, ProvidersRoutingModule, SharedModule],
  entryComponents: [ProvidersModalComponent]
})
export class ProvidersModule {}
