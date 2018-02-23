import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatsService } from '../../services/stats.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs/Subscription';
import { schemeCategory10 } from 'd3';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'app-dashboard.component.html'
})
export class AppDashboardComponent implements OnInit, OnDestroy {
  loading: boolean;
  sub: Subscription;
  colors: string[];
  memory: { total: number, free: number, used: number };
  memoryHuman: { total: string, free: string, used: string };
  memoryPercentage: string;
  cpuPercent: number;
  cpuCores: number[];
  containers: any[];

  constructor(private statsService: StatsService, private socketService: SocketService) {
    this.loading = true;

    this.colors = [...schemeCategory10];
    this.memory = { total: null, free: null, used: null };
    this.memoryHuman = { total: null, free: null, used: null };
    this.memoryPercentage = '0';
    this.cpuPercent = 0;
    this.cpuCores = [];
    this.containers = [];
  }

  ngOnInit() {
    this.sub = this.statsService.stats.subscribe(e => {
      this.loading = false;

      if (e.type === 'memory') {
        this.memory = {
          total: e.data.total,
          free: e.data.free,
          used: e.data.total - e.data.free
        };

        this.memoryHuman = {
          total: this.statsService.humanizeBytes(e.data.total),
          free: this.statsService.humanizeBytes(e.data.free),
          used: this.statsService.humanizeBytes(e.data.total - e.data.free)
        };

        this.memoryPercentage = Number(this.memory.used / this.memory.total * 100).toFixed(2);
      } else if (e.type === 'cpu') {
        this.cpuPercent = e.data.load;
        this.cpuCores = e.data.cores.map(core => core.total);
      } else if (e.type === 'containersStats') {
        this.containers = e.data.filter(container => container && container.name && container.name.startsWith('abstruse'));
      }
    });

    setTimeout(() => this.statsService.start());
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.statsService.stop();
  }

  stopJob(e: MouseEvent, container: string): void {
    e.preventDefault();
    e.stopPropagation();

    const job = container.split('_');
    if (job.length === 3) {
      this.socketService.emit({ type: 'stopJob', data: { jobId: job[2] } });
    }
  }
}
