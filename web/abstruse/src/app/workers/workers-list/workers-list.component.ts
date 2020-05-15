import { Component, OnInit, OnDestroy } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { WorkersService } from '../shared/workers.service';
import { DataService } from '../../shared/providers/data.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Subscription } from 'rxjs';
import { SocketEvent } from 'src/app/shared/models/socket.model';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.sass']
})
export class WorkersListComponent implements OnInit, OnDestroy {
  workers: Worker[] = [];
  fetchingWorkers: boolean;
  sub: Subscription;

  constructor(
    public workersService: WorkersService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.fetchWorkers();
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: '/subs/workers_usage' } });
    this.sub = this.dataService.socketOutput.subscribe((ev: SocketEvent) => {
      switch (ev.type) {
        case '/subs/workers_usage': {
          const worker = this.workers.find(w => w.certID === ev.data.cert_id);
          worker.updateUsage(ev.data);
          break;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { sub: '/subs/workers_usage' } });
    if (this.sub) { this.sub.unsubscribe(); }
  }

  private fetchWorkers(): void {
    this.fetchingWorkers = true;
    this.workersService.fetchWorkers()
      .subscribe((resp: JSONResponse) => {
        if (!resp || !resp.data || !resp.data.length) {
          return;
        }

        this.workers = resp.data.map((w: any) => {
          return new Worker(
            w.host.cert_id,
            w.addr,
            w.host.hostname,
            w.host.uptime,
            w.host.boot_time,
            w.host.procs,
            w.host.os,
            w.host.platform,
            w.host.platform_family,
            w.host.platform_version,
            w.host.kernel_version,
            w.host.kernel_arch,
            w.host.virtualization_system,
            w.host.virtualization_role,
            w.host.host_id,
            w.usage
          );
        });
      }, err => {
        console.error(err);
      }, () => {
        this.fetchingWorkers = false;
      });
  }
}
