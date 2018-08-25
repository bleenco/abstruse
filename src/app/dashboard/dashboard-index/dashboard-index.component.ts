import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../shared/dashboard.service';
import { subDays, format } from 'date-fns';
import { DataService } from '../../shared/providers/data.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-index',
  templateUrl: './dashboard-index.component.html',
  styleUrls: ['./dashboard-index.component.sass']
})
export class DashboardIndexComponent implements OnInit, OnDestroy {
  dateFrom: Date;
  dateTo: Date;
  chartData: any;
  sub: Subscription;
  memory: { total: number, free: number, used: number };
  cpuPercent = 0;
  cpuCores: number[] = [];
  containers: any[] = [];
  cpuChartData: any;
  cpuCoresData: any;

  constructor(public dashboard: DashboardService, public dataService: DataService) {
    // $blue: #2AA7FF
    // $green: #30D068
    // $red: #F44336
    // $yellow: #fdd835
    // this.chartData = [
    //   {
    //     title: 'Builds',
    //     type: 'line',
    //     data: {
    //       labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9am'],
    //       datasets: [
    //         {
    //           name: 'Passed Builds',
    //           values: [25, 40, 30, 35, 8, 52, 17, -4]
    //         },
    //         {
    //           name: 'Failed Builds',
    //           values: [25, 50, -10, 15, 18, 32, 27, 14]
    //         }
    //       ]
    //     },
    //     colors: ['#97D0AB', '#F4A7A1'],
    //     lineOptions: {
    //       dotSize: 5,
    //       hideLine: 0,
    //       hideDots: 0,
    //       heatline: 1,
    //       regionFill: 1
    //     }
    //   },
    //   {
    //     title: 'Line chart',
    //     type: 'line',
    //     data: {
    //       labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9am'],
    //       datasets: [
    //         {
    //           name: 'Some Data', color: 'light-blue',
    //           values: [25, 40, 30, 35, 8, 52, 17, -4]
    //         },
    //         {
    //           name: 'Another Set', color: 'violet',
    //           values: [25, 50, -10, 15, 18, 32, 27, 14]
    //         },
    //         {
    //           name: 'Yet Another', color: 'blue',
    //           values: [15, 20, -3, -15, 58, 12, -17, 37]
    //         }
    //       ]
    //     },
    //     colors: ['#97D0AB', '#FDEEA9', '#F4A7A1'],
    //     lineOptions: {
    //       dotSize: 5,
    //       hideLine: 0,
    //       hideDots: 0,
    //       heatline: 1,
    //       regionFill: 1
    //     }
    //   },
    // {
    //   title: 'Pie chart',
    //   type: 'pie',
    //   data: {
    //     labels: ['12am', '3am', '6am', '9am', '12pm'],
    //     datasets: [
    //       {
    //         title: 'Some Data', color: 'light-blue',
    //         values: [25, 40, 30, 35, 8]
    //       },
    //       {
    //         title: 'Another Set', color: 'violet',
    //         values: [25, 50, -10, 15, 18]
    //       },
    //       {
    //         title: 'Yet Another', color: 'blue',
    //         values: [15, 20, -3, -15, 58]
    //       }
    //     ]
    //   }
    // },
    // {
    //   title: 'Scatter chart',
    //   type: 'scatter',
    //   data: {
    //     labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9am'],
    //     datasets: [
    //       {
    //         title: 'Some Data', color: 'light-blue',
    //         values: [25, 40, 30, 35, 8, 52, 17, -4]
    //       },
    //       {
    //         title: 'Another Set', color: 'violet',
    //         values: [25, 50, -10, 15, 18, 32, 27, 14]
    //       },
    //       {
    //         title: 'Yet Another', color: 'blue',
    //         values: [15, 20, -3, -15, 58, 12, -17, 37]
    //       }
    //     ]
    //   }
    // },
    // {
    //   title: 'Percentage chart',
    //   type: 'percentage',
    //   data: {
    //     labels: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9am'],
    //     datasets: [
    //       {
    //         title: 'Some Data',
    //         color: 'light-blue',
    //         values: [25, 40, 30, 35, 8, 52, 17, -4]
    //       },
    //       {
    //         title: 'Another Set',
    //         color: 'violet',
    //         values: [25, 50, -10, 15, 18, 32, 27, 14]
    //       }
    //     ]
    //   }
    // }
    // ];
  }

  ngOnInit() {
    this.dateFrom = subDays(new Date, 30);
    this.dateTo = new Date();
    this.updateJobRunsChart();

    this.dashboard.updateCpuCores.emit(this.cpuCoresData);

    this.sub = this.dataService.socketOutput
      .pipe(
        filter(event => event.type === 'memory' || event.type === 'cpu' || event.type === 'containerStats')
      )
      .subscribe(event => {
        switch (event.type) {
          case 'memory':
            this.memory = {
              total: event.data.total,
              free: event.data.free,
              used: event.data.total - event.data.free
            };
            break;
          case 'cpu':
            this.cpuPercent = event.data.load;
            this.cpuCores = event.data.cores.map(core => core.total);

            this.cpuChartData = {
              title: 'CPU Usage',
              type: 'pie',
              data: {
                labels: ['Used', 'Free'],
                datasets: [
                  { values: [this.cpuPercent, 100 - this.cpuPercent] }
                ],
              },
              colors: ['#F4A7A1', '#97D0AB'],
              barOptions: {
                height: 10,
                depth: 5
              }
            };
            this.dashboard.updateCpuPercentage.emit(this.cpuChartData);

            this.cpuCoresData = {
              title: 'CPU Cores',
              type: 'bar',
              data: {
                labels: this.cpuCores.map((_, i) => i),
                datasets: [
                  { name: '', values: this.cpuCores }
                ],
                yMarkers: [
                  {
                    label: 'CPU Usage',
                    value: this.cpuCores.reduce((p, c) => p + c, 0) / this.cpuCores.length,
                    options: { labelPos: 'right' }
                  }
                ]
              },
              colors: ['#97D0AB', '#F4A7A1'],
              barOptions: {
                spaceRatio: 0.2
              },
              tooltipOptions: {
                formatTooltipX: d => 'CPU #' + d,
                formatTooltipY: d => d + '%'
              }
            };

            this.dashboard.updateCpuCores.emit(this.cpuCoresData);
            break;
          case 'containerStats':
            this.containers = event.data.filter(container => container && container.name && container.name.startsWith('abstruse'));
            break;
        }
      });

    this.dataService.socketInput.emit({ type: 'subscribeToStats' });
  }

  ngOnDestroy() {
    this.dataService.socketInput.emit({ type: 'unsubscribeFromStats' });
  }

  updateJobRunsChart() {
    this.dashboard.fetchJobRunsData(this.dateFrom, this.dateTo).subscribe(resp => {
      const keys = Object.keys(resp.data.failed)
        .concat(Object.keys(resp.data.success))
        .filter((e, p, arr) => arr.indexOf(e) === p)
        .sort();
      const dates = keys
        .filter((e, pos, arr) => arr.indexOf(e) === pos)
        .map(d => format(d, 'DD.MM'));

      this.chartData = {
        title: 'Builds',
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            { name: 'Passed Builds', values: keys.map(key => resp.data.success[key] || 0) },
            { name: 'Failed Builds', values: keys.map(key => resp.data.failed[key] || 0) }
          ],
        },
        colors: ['#97D0AB', '#F4A7A1'],
        lineOptions: {
          dotSize: 5,
          hideLine: 0,
          hideDots: 0,
          heatline: 0,
          regionFill: 1
        },
        axisOptions: {
          xIsSeries: true
        }
      };

      this.dashboard.updateJobRunsChart.emit(this.chartData);
    });
  }

}
