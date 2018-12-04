import { Component, OnInit, OnDestroy } from '@angular/core';
import { WorkersService } from '../shared/workers.service';
import { Worker } from '../shared/worker.class';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/providers/data.service';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.sass']
})
export class WorkersListComponent implements OnInit, OnDestroy {
  workers: Worker[];
  fetchingWorkers: boolean;
  sub: Subscription;

  constructor(
    public workersService: WorkersService,
    public dataService: DataService
  ) { }

  ngOnInit() {
    this.workers = [];
    this.fetchWorkers();

    this.dataService.socketInput.emit({ type: 'subscribe', data: { event: 'worker_updates', id: '' } });
    this.sub = this.dataService.socketOutput.subscribe(ev => {
      switch (ev.type) {
        case 'worker_status':
        const worker = this.findWorker(ev.data.cert_id);
        worker.status = ev.data.status;
        break;
      }
    });
  }

  ngOnDestroy() {
    this.dataService.socketInput.emit({ type: 'unsubscribe', data: { event: 'worker_updates', id: '' } });
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  fetchWorkers(): void {
    this.fetchingWorkers = true;
    this.workersService.fetchWorkers().subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.workers = resp.data.map(w => {
          return new Worker(w.id, w.cert_id, w.ip, w.priority, w.status, w.created_at, w.updated_at);
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
