import { Injectable, Provider, EventEmitter } from '@angular/core';

export interface Notification {
  message: string;
  duration: number;
  color: 'green' | 'red' | 'blue';
  datetime: Date;
}

@Injectable()
export class NotificationService {
  events: EventEmitter<Notification>;

  constructor() {
    this.events = new EventEmitter<Notification>();
  }
}

export const NotificationServiceProvider: Provider = {
  provide: NotificationService,
  useClass: NotificationService
};
