import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartModule, RealtimeCanvasChartModule } from 'ngx-graph';
import { SharedModule } from '../shared';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { IndexComponent } from './index/index.component';

@NgModule({
  declarations: [IndexComponent],
  imports: [CommonModule, DashboardRoutingModule, SharedModule, BarChartModule, RealtimeCanvasChartModule]
})
export class DashboardModule {}
