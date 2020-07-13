import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProvidersRoutingModule } from './providers-routing.module';
import { ProvidersListComponent } from './providers-list/providers-list.component';
import { ProvidersModalComponent } from './providers-modal/providers-modal.component';
import { SharedModule } from '../shared';
import { ProvidersListItemComponent } from './providers-list-item/providers-list-item.component';
import { ProvidersReposListComponent } from './providers-repos-list/providers-repos-list.component';
import { ProvidersReposListItemComponent } from './providers-repos-list-item/providers-repos-list-item.component';
import { ProvidersComponent } from './providers/providers.component';
import { ProviderItemComponent } from './provider-item/provider-item.component';

@NgModule({
  declarations: [ProvidersListComponent, ProvidersModalComponent, ProvidersListItemComponent, ProvidersReposListComponent, ProvidersReposListItemComponent, ProvidersComponent, ProviderItemComponent],
  imports: [CommonModule, ProvidersRoutingModule, SharedModule],
  entryComponents: [ProvidersModalComponent]
})
export class ProvidersModule {}
