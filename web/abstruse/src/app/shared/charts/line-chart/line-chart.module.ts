import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LineChartComponent } from './line-chart.component';
import { ResizeService } from '../../providers/resize.service';

@NgModule({
  imports: [CommonModule],
  declarations: [LineChartComponent],
  exports: [LineChartComponent],
  providers: [ResizeService]
})
export class LineChartModule { }
