import { Component, OnInit, OnDestroy } from '@angular/core';
import { Worker, generateWorker } from '../shared/worker.class';
import {
  WorkersService,
  workerSubUsageEvent,
  workerSubAddEvent,
  workerSubDeleteEvent
} from '../shared/workers.service';
import { DataService } from '../../shared/providers/data.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Subscription, generate } from 'rxjs';
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

  constructor(public workersService: WorkersService, public dataService: DataService) {}

  ngOnInit(): void {
    this.fetchWorkers();
    this.subscribe();
    this.sub.add(
      this.dataService.socketOutput.subscribe((ev: SocketEvent) => {
        switch (ev.type) {
          case workerSubDeleteEvent: {
            this.workers = this.workers.filter(w => w.id !== ev.data.id);
            break;
          }
          case workerSubAddEvent: {
            this.workers = this.workers.filter(w => w.id !== ev.data.id);
            this.workers.push(generateWorker(ev.data));
            break;
          }
          case workerSubUsageEvent: {
            const worker = this.workers.find(w => w.id === ev.data.id);
            worker.updateUsage(ev.data);
            break;
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private fetchWorkers(): void {
    this.fetchingWorkers = true;
    this.workersService.fetchWorkers().subscribe(
      (workers: Worker[]) => {
        this.workers = workers;
      },
      err => {
        console.error(err);
        this.workers = [];
        this.fetchingWorkers = false;
      },
      () => {
        this.fetchingWorkers = false;
      }
    );
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
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
