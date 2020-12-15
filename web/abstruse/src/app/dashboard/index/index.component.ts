import { Component, OnInit } from '@angular/core';
import { addDays } from 'date-fns';
import { BarChartData, BarChartOptions, LineChartData, LineChartOptions } from 'ngx-graph';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})
export class IndexComponent implements OnInit {
  loading = false;

  cards: { title: string; num: number; percent: number; icon: string; type: 'currency' | 'number' }[] = [
    { title: 'Jobs in Queue', num: 15, percent: 24, icon: 'far fa-file-alt', type: 'number' },
    { title: 'Jobs Running', num: 4, percent: 44, icon: 'fas fa-project-diagram', type: 'currency' },
    { title: 'Server CPU Usage', num: 256, percent: 36, icon: 'fas fa-user-friends', type: 'number' },
    { title: 'Server Memory Usage', num: 1150, percent: 15, icon: 'fas fa-key', type: 'number' }
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
    height: 300,
    margin: { top: 20, right: 0, bottom: 30, left: 80 },
    yGrid: {
      min: 0,
      max: 25000,
      tickFontSize: 11,
      tickFormat: (v: number | Date) => `€ ${v}`,
      tickPadding: 40,
      tickNumber: 6,
      tickFontWeight: 'normal',
      color: '#EDEDEE',
      opacity: 0.6
    },
    xGrid: { tickPadding: 10, tickFontSize: 11, color: '#ffffff', tickFontWeight: 'normal' },
    colors: ['#48bb78'],
    borderRadius: 5,
    padding: 0.3
  };
  barChartData: BarChartData[];

  constructor() {
    this.barChartData = [
      'Gray',
      'Red',
      'Orange',
      'Yellow',
      'Green',
      'Teal',
      'Blue',
      'Indigo',
      'Purple',
      'Pink',
      'Black',
      'White',
      'Cyan',
      'Magenta'
    ].map(color => ({ id: color, y: this.randomInt(10000, 22000) }));
  }

  ngOnInit(): void {}

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
}
