import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: 'app-notification.component.html'
})
export class AppNotificationComponent implements OnInit {
  visible: boolean;
  color: 'green' | 'red' | 'blue';
  msg: string;
  timeout: any;
  notifications: Notification[];

  constructor(private notificationService: NotificationService) {
    this.msg = null;
    this.notifications = [];
  }

  ngOnInit() {
    this.notificationService.events.subscribe((notify: Notification) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.notifications.push(notify);
      this.visible = true;
      this.msg = notify.message;
      this.color = notify.color;
      this.timeout = setTimeout(() => this.visible = false, notify.duration);
    });
  }
}
