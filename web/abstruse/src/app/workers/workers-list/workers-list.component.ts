import { Component, OnInit, OnDestroy } from '@angular/core';
import { Worker } from '../shared/worker.class';
import { WorkersService, workerSubUsageEvent, workerSubAddEvent, workerSubDeleteEvent } from '../shared/workers.service';
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
  sub: Subscription = new Subscription();

  constructor(
    public workersService: WorkersService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.sub.add(
      this.dataService.socketOutput.subscribe((ev: SocketEvent) => {
        console.log(ev);
        switch (ev.type) {
          case workerSubDeleteEvent: {
            this.workers = this.workers.filter(w => w.id !== ev.data.id);
            break;
          }
          case workerSubAddEvent: {
            this.workers = this.workers.filter(w => w.id !== ev.data.id);
            this.workers.push(this.newWorker(ev.data));
            break;
          }
          case workerSubUsageEvent: {
            const worker = this.workers.find(w => w.id === ev.data.id);
            worker.updateUsage(ev.data);
            break;
          }
        }
      }));
    this.sub.add(
      this.dataService.connected.subscribe((status: boolean) => {
        if (status) {
          this.fetchWorkers();
          this.subscribe();
        } else {
          this.workers = [];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private fetchWorkers(): void {
    this.fetchingWorkers = true;
    this.workersService.fetchWorkers()
      .subscribe((resp: JSONResponse) => {
        if (!resp || !resp.data || !resp.data.length) {
          return;
        }

        this.workers = resp.data.map((w: any) => {
          return this.newWorker(w);
        });
      }, err => {
        console.error(err);
      }, () => {
        this.fetchingWorkers = false;
      });
  }

  private subscribe(): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: workerSubAddEvent } });
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: workerSubDeleteEvent } });
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: workerSubUsageEvent } });
  }

  private unsubscribe(): void {
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { sub: workerSubAddEvent } });
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { sub: workerSubDeleteEvent } });
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { sub: workerSubUsageEvent } });
    if (this.sub) { this.sub.unsubscribe(); }
  }

  private newWorker(w: any): Worker {
    return new Worker(
      w.id,
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
  }
}
