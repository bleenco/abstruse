import { NgModule } from '@angular/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardIndexComponent } from './dashboard-index/dashboard-index.component';
import { FrappeChartComponent } from './charts/frappe-chart/frappe-chart.component';
import { SharedModule } from '../shared/modules/shared.module';
import { ProgressChartComponent } from './charts/progress-chart/progress-chart.component';

@NgModule({
  imports: [
    DashboardRoutingModule,
    SharedModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    DashboardIndexComponent,
    FrappeChartComponent,
    ProgressChartComponent
  ],
  providers: []
})
export class DashboardModule { }
