import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Subject } from 'rxjs/Subject';
import { filter } from 'rxjs/operators';

export interface NotificationType {
  message: string;
  type: 'error' | 'warning' | 'info';
}

@Injectable()
export class NotificationService {
  notifications: Subject<NotificationType>;

  constructor(private socket: SocketService) {
    this.notifications = new Subject();
  }

  sub(): void {
    this.socket.emit({ type: 'subscribeToNotifications' });

    this.socket.outputEvents
      .pipe(filter(e => e.type === 'notification'))
      .subscribe(e => this.emit(e.notification));
  }

  emit(notify: NotificationType): void {
    this.notifications.next(notify);
  }
}
