import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RealtimeChartComponent } from './realtime-chart.component';
import { ResizeService } from '../../providers/resize.service';

@NgModule({
  imports: [CommonModule],
  declarations: [RealtimeChartComponent],
  exports: [RealtimeChartComponent],
  providers: [ResizeService]
})
export class RealtimeChartModule { }
