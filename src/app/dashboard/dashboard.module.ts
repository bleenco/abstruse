import { NgModule } from '@angular/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardIndexComponent } from './dashboard-index/dashboard-index.component';
import { FrappeChartComponent } from './charts/frappe-chart/frappe-chart.component';
import { SharedModule } from '../shared/modules/shared.module';

@NgModule({
  imports: [
    DashboardRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    DashboardIndexComponent,
    FrappeChartComponent
  ],
  providers: []
})
export class DashboardModule { }
