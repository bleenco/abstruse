import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatsService } from '../../services/stats.service';
import { Subscription } from 'rxjs/Subscription';
import { schemeCategory20b } from 'd3';

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
  runs: { success: {}, failed: {} };
  cpuPercent: number;
  cpuCores: number[];
  containers: any[];

  constructor(private statsService: StatsService) {
    this.loading = true;

    this.colors = schemeCategory20b;
    this.memory = { total: null, free: null, used: null };
    this.memoryHuman = { total: null, free: null, used: null };
    this.memoryPercentage = '0';
    this.runs = { success: {}, failed: {} };
    this.cpuPercent = 0;
    this.cpuCores = [];
    this.containers = [];
  }

  ngOnInit() {
    this.sub = this.statsService.stats.subscribe(e => {
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
        this.containers = e.data;
      }
    });

    this.statsService.getJobRuns().then((runs: any) => {
      this.loading = false;
      this.runs = runs;
    });

    setTimeout(() => this.statsService.start());
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.statsService.stop();
  }
}
