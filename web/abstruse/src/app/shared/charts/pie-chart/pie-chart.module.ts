import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PieChartComponent } from './pie-chart.component';
import { ResizeService } from '../../providers/resize.service';

@NgModule({
  imports: [CommonModule],
  declarations: [PieChartComponent],
  exports: [PieChartComponent],
  providers: [ResizeService]
})
export class PieChartModule { }
