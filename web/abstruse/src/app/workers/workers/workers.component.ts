import { Component, OnInit, OnDestroy } from '@angular/core';
import { Worker, generateWorker } from '../shared/worker.model';
import {
  WorkersService,
  workerSubDeleteEvent,
  workerSubAddEvent,
  workerSubUsageEvent
} from '../shared/workers.service';
import { DataService } from 'src/app/shared/providers/data.service';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SocketEvent } from 'src/app/shared/models/socket.model';

@UntilDestroy()
@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.sass']
})
export class WorkersComponent implements OnInit, OnDestroy {
  loading = false;
  workers: Worker[] = [];
  error: string | null = null;

  constructor(private workersService: WorkersService, private dataService: DataService) {}

  ngOnInit(): void {
    this.find();
    this.dataService.socketOutput.pipe(untilDestroyed(this)).subscribe((ev: SocketEvent) => {
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
          if (worker) {
            worker.updateUsage(ev.data);
          }
          break;
        }
      }
    });
    this.subscribeToWorkersEvents();
  }

  ngOnDestroy(): void {
    this.dataService.unsubscribeAll();
  }

  find(): void {
    this.loading = true;
    this.workersService
      .find()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.workers = resp;
        },
        err => (this.error = err.message)
      );
  }

  private subscribeToWorkersEvents(): void {
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: workerSubAddEvent } });
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: workerSubDeleteEvent } });
    this.dataService.socketInput.emit({ type: 'subscribe', data: { sub: workerSubUsageEvent } });
  }
}
