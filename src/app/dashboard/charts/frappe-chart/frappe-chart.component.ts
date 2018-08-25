import { Component, OnInit, ElementRef } from '@angular/core';
import { Chart } from 'frappe-charts/dist/frappe-charts.esm';
import { DashboardService } from '../../shared/dashboard.service';

@Component({
  selector: 'app-frappe-chart',
  templateUrl: './frappe-chart.component.html',
  styleUrls: ['./frappe-chart.component.sass']
})
export class FrappeChartComponent implements OnInit {
  el: HTMLElement;
  chart: Chart;

  constructor(public elementRef: ElementRef, public dashboard: DashboardService) { }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.frappe-chart');

    this.dashboard.updateJobRunsChart.subscribe(data => {
      this.renderChart(data);
      // this.chart.update(this.data);
    });
  }

  private renderChart(data: any): void {
    data = Object.assign({}, data, { height: 250 });
    if (data.data.labels.length < 2) {
      return;
    }

    if (this.chart) {
      this.chart.update(data.data);
    } else {
      this.chart = new Chart(this.el, data);
    }
  }
}
