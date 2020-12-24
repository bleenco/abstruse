import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { format, subDays } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/esm';
import { BarChartData, BarChartOptions, RealtimeCanvasChartOptions, RealtimeChartData } from 'ngx-graph';
import { delay, finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/shared/auth.service';
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
  loadingJobs = false;
  error: string | null = null;
  jobHistory: 'month' | 'week' = 'month';
  schedulerStatusSaving = false;
  schedulerStatus = false;

  data: { cpu: number; mem: number; queued: number; pending: number; workers: number; max: number; running: number } = {
    cpu: 0,
    mem: 0,
    queued: 0,
    pending: 0,
    workers: 0,
    max: 0,
    running: 0
  };

  barChartoptions: BarChartOptions = {
    mode: 'stacked',
    height: 320,
    margin: { top: 30, right: 90, bottom: 30, left: 55 },
    yGrid: {
      min: 0,
      tickFontSize: 11,
      tickFormat: (v: number | Date) => `${v}`,
      tickPadding: 40,
      tickNumber: 6,
      tickFontWeight: 'normal',
      color: '#EAEDF3',
      size: 2,
      opacity: 0.5,
      dashed: true
    },
    xGrid: { tickPadding: 10, tickFontSize: 12, color: '#ffffff', tickFontWeight: 'normal' },
    colors: ['#9ae6b4', '#eb6e60', '#e2e8f0'],
    borderRadius: 5,
    padding: 0.3,
    legend: true,
    legendFontColor: '#4E5859',
    hoverEffect: true,
    hoverEffectColor: '#666'
  };
  barChartData: BarChartData;
  barData: BarChartData = [];

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

  constructor(private dashboardService: DashboardService, private dataService: DataService, public auth: AuthService) {
    this.barChartData = [];
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

  stats(loading: boolean = true): void {
    if (loading) {
      this.loading = true;
      this.cpuRealtimeChartData[0] = [];
      this.memRealtimeChartData[0] = [];
    }

    this.dashboardService
      .stats()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.schedulerStatusSaving = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(resp => {
        if (loading) {
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

          this.jobsLastMonth();
        }

        this.schedulerStatus = resp.status;
      });
  }

  jobsLastMonth(): void {
    this.jobHistory = 'month';
    const [from, to] = [subDays(new Date(), 31), new Date()];
    this.jobsHistory(from, to);
  }

  jobsLastWeek(): void {
    this.jobHistory = 'week';
    const [from, to] = [subDays(new Date(), 7), new Date()];
    this.jobsHistory(from, to);
  }

  jobsHistory(from: Date, to: Date): void {
    this.loadingJobs = true;
    this.dashboardService
      .jobs(from, to)
      .pipe(
        delay(300),
        finalize(() => (this.loadingJobs = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.barData = eachDayOfInterval({ start: from, end: to }).map(d => {
            return {
              category: format(d, 'd MMM'),
              values: ['Passed', 'Failed', 'Pending'].map(i => ({ id: i, value: 0 }))
            };
          });

          ([...resp] || []).forEach(d => {
            const category = format(d.createdAt || new Date(), 'd MMM');
            const status = d.status;
            const index = this.barData.findIndex((j: any) => j.category === category);
            if (index !== -1) {
              switch (status) {
                case 'passing':
                  this.barData[index].values[0].value++;
                  break;
                case 'failing':
                  this.barData[index].values[1].value++;
                  break;
                case 'running':
                case 'queued':
                  this.barData[index].values[2].value++;
                  break;
              }
            }
          });

          if (this.barData.length > 8) {
            const values = this.barData.map(d => d.category).filter((_, i) => i % 3 === 0);
            this.barChartoptions = { ...this.barChartoptions, ...{ xGrid: { tickValues: values, color: '#ffffff' } } };
          } else {
            const values = this.barData.map(d => d.category);
            this.barChartoptions = { ...this.barChartoptions, ...{ xGrid: { tickValues: values, color: '#ffffff' } } };
          }
        },
        err => {
          this.error = err.message;
        }
      );
  }

  pauseResumeScheduler(): void {
    this.schedulerStatusSaving = true;

    if (!this.schedulerStatus) {
      this.dashboardService
        .resumeScheduler()
        .pipe(untilDestroyed(this))
        .subscribe(
          () => {
            this.stats(false);
          },
          err => {
            this.error = err.message;
          }
        );
    } else {
      this.dashboardService
        .pauseScheduler()
        .pipe(untilDestroyed(this))
        .subscribe(
          () => {
            this.stats(false);
          },
          err => {
            this.error = err.message;
          }
        );
    }
  }

  private subscribeToEvents(): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: statsSub } });
  }
}
