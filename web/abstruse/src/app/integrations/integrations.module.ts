import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationsRoutingModule } from './integrations-routing.module';
import { IntegrationsListComponent } from './integrations-list/integrations-list.component';
import { IntegrationsModalComponent } from './integrations-modal/integrations-modal.component';
import { SharedModule } from '../shared/shared.module';
import { IntegrationsListItemComponent } from './integrations-list-item/integrations-list-item.component';

@NgModule({
  declarations: [
    IntegrationsListComponent,
    IntegrationsModalComponent,
    IntegrationsListItemComponent
  ],
  imports: [
    CommonModule,
    IntegrationsRoutingModule,
    SharedModule.forRoot()
  ],
  entryComponents: [IntegrationsModalComponent]
})
export class IntegrationsModule { }
