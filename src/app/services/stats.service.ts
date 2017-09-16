import { Injectable, Provider, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SocketService } from './socket.service';
import { ApiService } from './api.service';

@Injectable()
export class StatsService {
  stats: EventEmitter<any>;
  sub: Subscription;

  constructor(private socketService: SocketService, private apiService: ApiService) {
    this.stats = new EventEmitter<any>();
  }

  start(): void {
    if (!this.sub) {
      this.sub = this.socketService.outputEvents
        .filter(e => e.type === 'memory' || e.type === 'cpu')
        .subscribe(e => this.stats.emit(e));
    }

    this.socketService.emit({ type: 'subscribeToStats' });
  }

  stop(): void {
    this.socketService.emit({ type: 'unsubscribeFromStats' });
  }

  getJobRuns(): Promise<any[]> {
    return this.apiService.statsJobRuns().toPromise().then(runs => runs);
  }

  humanizeBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 Byte';
    }

    const k = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
