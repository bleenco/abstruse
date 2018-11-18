import { Component, OnInit, ElementRef, Input, OnDestroy, EventEmitter } from '@angular/core';
import { Chart } from 'frappe-charts/dist/frappe-charts.esm';
import { DashboardService } from '../../shared/dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-frappe-chart',
  templateUrl: './frappe-chart.component.html',
  styleUrls: ['./frappe-chart.component.sass']
})
export class FrappeChartComponent implements OnInit, OnDestroy {
  @Input() events: EventEmitter<any> = new EventEmitter<any>();

  el: HTMLElement;
  chart: Chart;
  sub: Subscription;
  initializing: boolean;
  cpuHistory: any[] = [];

  constructor(public elementRef: ElementRef, public dashboard: DashboardService) { }

  ngOnInit() {
    this.initializing = true;
    this.el = this.elementRef.nativeElement.querySelector('.frappe-chart');

    this.sub = this.events.subscribe(data => {
      if (data.type === 'line') {
        this.renderLineChart(data);
      } else if (data.type === 'pie') {
        this.renderPercentageChart(data);
      } else if (data.type === 'bar') {
        this.renderBarChart(data);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private renderLineChart(data: any): void {
    this.initializing = false;

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

  private renderBarChart(data: any): void {
    this.initializing = false;

    data = Object.assign({}, data, { height: 250 });
    if (this.chart) {
      this.chart.update(data.data);
    } else {
      this.chart = new Chart(this.el, data);
    }
  }

  private renderPercentageChart(data: any): void {
    this.initializing = false;

    data = Object.assign({}, data, { height: 200 });
    if (this.chart) {
      this.chart.update(data.data);
    } else {
      this.chart = new Chart(this.el, data);
    }
  }
}
