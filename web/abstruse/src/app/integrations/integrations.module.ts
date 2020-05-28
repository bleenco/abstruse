import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntegrationsRoutingModule } from './integrations-routing.module';
import { IntegrationsListComponent } from './integrations-list/integrations-list.component';
import { IntegrationsModalComponent } from './integrations-modal/integrations-modal.component';

@NgModule({
  declarations: [
    IntegrationsListComponent,
    IntegrationsModalComponent
  ],
  imports: [
    CommonModule,
    IntegrationsRoutingModule
  ],
  entryComponents: [IntegrationsModalComponent]
})
export class IntegrationsModule { }
