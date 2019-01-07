import { Component, OnInit, OnDestroy } from '@angular/core';
import { WorkersService } from '../shared/workers.service';
import { Worker, WorkerUsage } from '../shared/worker.class';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/providers/data.service';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.sass']
})
export class WorkersListComponent implements OnInit, OnDestroy {
  worker: Worker;
  workers: Worker[];
  fetchingWorkers: boolean;
  sub: Subscription;

  constructor(
    public workersService: WorkersService,
    public dataService: DataService
  ) { }

  ngOnInit() {
    this.worker = null;
    this.workers = [];
    this.fetchWorkers();

    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'worker_updates', id: '' } });
    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'worker_usage', id: '' } });
    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'worker_capacity', id: '' } });

    this.sub = this.dataService.socketOutput.subscribe(ev => {
      const worker = this.findWorker(ev.data.cert_id);
      switch (ev.type) {
        case 'worker_status':
          worker.setStatus(ev.data.status);
          break;
        case 'worker_usage':
          worker.setUsage(ev.data.cpu, ev.data.memory);
          break;
        case 'worker_capacity':
          worker.setCapacity(ev.data.total, ev.data.used);
          break;
      }
    });
  }

  ngOnDestroy() {
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { event: 'worker_updates', id: '' } });
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { event: 'worker_usage', id: '' } });
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { event: 'worker_capacity', id: '' } });

    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  fetchWorkers(): void {
    this.fetchingWorkers = true;
    this.workersService.fetchWorkers().subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.workers = resp.data.map((w: any) => {
          const worker = new Worker(w.id, w.cert_id, w.ip, w.status, w.created_at, w.updated_at);
          worker.setCapacity(w.capacity, w.capacity_load);
          worker.setUsage(w.cpu, w.memory);
          return worker;
        });
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingWorkers = false;
    });
  }

  private findWorker(cert_id: string): Worker {
    return this.workers.find(worker => worker.cert_id === cert_id);
  }
}
