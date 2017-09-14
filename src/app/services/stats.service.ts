import { Injectable, Provider, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { SocketService } from './socket.service';

@Injectable()
export class StatsService {
  stats: EventEmitter<any>;
  sub: Subscription;

  constructor(private socketService: SocketService) {
    this.stats = new EventEmitter<any>();
  }

  start(): void {
    this.sub = this.socketService.onMessage()
      .filter(e => e.type === 'memory')
      .subscribe(e => this.stats.emit(e));

    this.socketService.emit({ type: 'subscribeToStats' });
  }

  stop(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    this.socketService.emit({ type: 'unsubscribeFromStats' });
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
