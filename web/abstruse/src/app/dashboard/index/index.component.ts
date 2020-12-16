import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addDays, subSeconds } from 'date-fns';
import { BarChartData, BarChartOptions, LineChartData, LineChartOptions, RealtimeCanvasChartOptions } from 'ngx-graph';
import { timer } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})
export class IndexComponent implements OnInit {
  loading = false;

  cards: { title: string; num: number; percent: number; icon: string; type: 'currency' | 'number' }[] = [
    { title: 'Jobs in Queue', num: 15, percent: 24, icon: 'fas fa-list-alt', type: 'number' },
    { title: 'Jobs Running', num: 4, percent: 44, icon: 'fas fa-clipboard-list', type: 'number' },
    { title: 'Server CPU Usage', num: 256, percent: 36, icon: 'fas fa-microchip', type: 'number' },
    { title: 'Server Memory Usage', num: 1150, percent: 15, icon: 'fas fa-memory', type: 'number' }
  ];

  lineChartOptions: LineChartOptions = {
    height: 300,
    margin: { top: 20, right: 30, bottom: 30, left: 60 },
    xScale: { min: 'auto', max: 'auto', type: 'linear' },
    yScale: { min: 0, max: 1000, type: 'linear' },
    xGrid: {
      enable: false,
      color: '#EDEDEE',
      size: 2,
      dashed: true,
      opacity: 0.6,
      text: true,
      textSize: 12,
      textColor: '#CBCBCB',
      fontFamily: 'sans-serif',
      tickPadding: 20,
      tickTextAnchor: 'middle',
      tickNumber: 6
    },
    yGrid: {
      enable: true,
      color: '#EDEDEE',
      size: 2,
      dashed: false,
      tickPadding: 20,
      tickTextAnchor: 'end',
      tickNumber: 6,
      opacity: 0.6,
      textColor: '#CBCBCB',
      textSize: 12,
      tickFormat: (val: number | Date) => String(val)
    },
    transitions: true,
    initialTransition: true,
    interaction: { enable: false }
  };
  lineChartData: LineChartData[] = [
    new LineChartData({
      id: 'progress',
      data: this.generateRandomDateValues(12, 200, 700),
      area: false,
      areaOpacity: 1,
      curve: 'cardinal',
      markers: false,
      color: '#48bb78',
      lineSize: 3
    }),
    new LineChartData({
      id: 'income',
      data: this.generateRandomDateValues(12, 200, 700),
      area: false,
      areaOpacity: 1,
      curve: 'cardinal',
      markers: false,
      lineSize: 3,
      color: '#a0aec0'
    })
  ];

  barChartoptions: BarChartOptions = {
    height: 320,
    margin: { top: 20, right: 0, bottom: 30, left: 60 },
    yGrid: {
      min: 0,
      max: 25000,
      tickFontSize: 11,
      tickFormat: (v: number | Date) => `${v}`,
      tickPadding: 40,
      tickNumber: 6,
      tickFontWeight: 'normal',
      color: '#EDEDEE',
      opacity: 0.6
    },
    xGrid: { tickPadding: 10, tickFontSize: 12, color: '#ffffff', tickFontWeight: 'normal' },
    colors: ['#48bb78'],
    borderRadius: 5,
    padding: 0.2
  };
  barChartData: BarChartData[];

  // realtimeChartOptions: RealtimeChartOptions = {
  //   height: 150,
  //   margin: { left: 40, right: 10, bottom: 30, top: 5 },
  //   lines: [{ color: '#48bb78', lineWidth: 2, area: true, areaColor: '#48bb78', areaOpacity: 0.02 }],
  //   xGrid: {
  //     tickPadding: 15,
  //     tickNumber: 5,
  //     tickFontSize: 11,
  //     tickFontWeight: 'normal',
  //     tickFontColor: '#CBCBCB',
  //     color: '#ffffff'
  //   },
  //   yGrid: {
  //     min: 0,
  //     max: 100,
  //     tickNumber: 5,
  //     tickFormat: (v: string | number) => `${v}%`,
  //     tickPadding: 20,
  //     tickFontWeight: 'normal',
  //     tickFontColor: '#CBCBCB',
  //     tickFontSize: 11
  //   },
  //   timeSlots: 60
  // };
  realtimeChartOptions: RealtimeCanvasChartOptions = {
    height: 150,
    margin: { left: 40, top: 10 },
    fps: 24,
    timeSlots: 60,
    xGrid: {
      tickPadding: 15,
      tickNumber: 5,
      tickFontSize: 10,
      tickFontWeight: 'normal',
      tickFontColor: '#718096',
      color: '#EAEDF3',
      opacity: 0.5
    },
    yGrid: {
      min: 0,
      max: 100,
      color: '#EAEDF3',
      opacity: 0.5,
      tickNumber: 4,
      tickFormat: (v: string | number) => `${v}%`,
      tickPadding: 20,
      tickFontWeight: 'normal',
      tickFontColor: '#718096',
      tickFontSize: 10
    },
    lines: [{ color: '#48bb78', opacity: 1, area: true, areaColor: '#48bb78', areaOpacity: 0.05, curve: 'basis' }]
  };
  realtimeChartData = [[...this.generateRandomRealtimeData(60, 1, 50, 75)]];

  constructor() {
    this.barChartData = [
      '11.12.',
      '12.12.',
      '13.12.',
      '14.12.',
      '15.12.',
      '16.12.',
      '17.12.',
      '18.12.',
      '19.12.',
      '20.12.',
      '21.12.',
      '22.12.',
      '23.12.',
      '24.12.',
      '25.12.',
      '26.12.'
    ].map(color => ({ id: color, y: this.randomInt(10000, 22000) }));
  }

  ngOnInit(): void {
    timer(0, 1000)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.realtimeChartData[0].push({ date: new Date(), value: this.randomInt(50, 75) });
        if (this.realtimeChartData[0].length - 2 > 60) {
          this.realtimeChartData[0].splice(0, 1);
        }
      });
  }

  private randomInt(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private generateRandomDateValues(
    n: number = 10,
    min = 0,
    max = 100,
    fromDate = new Date().setHours(0, 0, 0, 0)
  ): { x: Date; y: number }[] {
    return Array.from(Array(n).keys()).map((x, i) => ({ x: addDays(fromDate, i), y: this.randomInt(min, max) }));
  }

  private generateRandomRealtimeData(
    n: number = 10,
    step: number = 1,
    min: number = 0,
    max: number = 100,
    date = new Date()
  ): { date: Date; value: number }[] {
    return Array.from(Array(n).keys())
      .map((_, i) => ({
        date: subSeconds(date, i * step),
        value: this.randomInt(min, max)
      }))
      .reverse();
  }
}
