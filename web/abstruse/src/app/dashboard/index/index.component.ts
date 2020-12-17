import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addDays, subSeconds } from 'date-fns';
import {
  BarChartData,
  BarChartOptions,
  LineChartData,
  LineChartOptions,
  RealtimeCanvasChartOptions,
  RealtimeChartData
} from 'ngx-graph';
import { finalize } from 'rxjs/operators';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { DataService } from 'src/app/shared/providers/data.service';
import { DashboardService } from '../shared/dashboard.service';

const statsSub = '/subs/serverusage';

@UntilDestroy()
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.sass']
})
export class IndexComponent implements OnInit, OnDestroy {
  loading = false;
  data: { cpu: number; mem: number; queued: number; pending: number; workers: number; max: number; running: number } = {
    cpu: 0,
    mem: 0,
    queued: 0,
    pending: 0,
    workers: 0,
    max: 0,
    running: 0
  };

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

  timeSlots = 120;
  realtimeChartOptions: RealtimeCanvasChartOptions = {
    height: 150,
    margin: { left: 40, top: 10, bottom: 30, right: 10 },
    fps: 24,
    timeSlots: this.timeSlots,
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
    lines: [
      {
        color: '#48bb78',
        opacity: 1,
        area: true,
        areaColor: '#48bb78',
        areaOpacity: 0.05,
        curve: 'basis',
        lineWidth: 2
      }
    ]
  };
  cpuRealtimeChartData: RealtimeChartData[][] = [];
  memRealtimeChartData: RealtimeChartData[][] = [];

  get pendingPercent(): number {
    return Math.round(Number((this.data.running / this.data.max) * 100)) || 0;
  }

  get queuedPercent(): number {
    return Math.round(Number((this.data.queued / (this.data.queued + this.data.running)) * 100)) || 0;
  }

  constructor(private dashboardService: DashboardService, private dataService: DataService) {
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
    this.stats();

    this.dataService.socketOutput.pipe(untilDestroyed(this)).subscribe((ev: SocketEvent) => {
      if (ev.type === statsSub) {
        this.cpuRealtimeChartData[0] = this.cpuRealtimeChartData[0].slice(-this.timeSlots + 1);
        this.cpuRealtimeChartData[0].push({ date: new Date(), value: ev.data.cpu });
        this.memRealtimeChartData[0] = this.memRealtimeChartData[0].slice(-this.timeSlots + 1);
        this.memRealtimeChartData[0].push({ date: new Date(), value: ev.data.mem });

        this.data = { ...ev.data };
      }
    });

    this.subscribeToEvents();
  }

  ngOnDestroy(): void {
    this.dataService.unsubscribeAll();
  }

  stats(): void {
    this.loading = true;
    this.cpuRealtimeChartData[0] = [];
    this.memRealtimeChartData[0] = [];
    this.dashboardService
      .stats()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(resp => {
        const usage = resp.usage || [];
        if (usage.length) {
          const last = usage[usage.length - 1];
          this.data.cpu = last.cpu;
          this.data.mem = last.mem;
        }

        this.cpuRealtimeChartData[0] = usage.map((u: any) => ({ date: new Date(u.timestamp), value: u.cpu }));
        this.memRealtimeChartData[0] = usage.map((u: any) => ({ date: new Date(u.timestamp), value: u.mem }));

        const stats = resp.stats || [];
        if (stats.length) {
          const last = stats[stats.length - 1];
          this.data.queued = last.queued;
          this.data.pending = last.pending;
          this.data.workers = last.workers;
          this.data.max = last.max;
          this.data.running = last.running;
        }
      });
  }

  private subscribeToEvents(): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: statsSub } });
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
}
