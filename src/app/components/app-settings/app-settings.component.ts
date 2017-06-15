import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'app-settings.component.html'
})
export class AppSettingsComponent implements OnInit {
  loading: boolean;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    let notify: Notification = {
      message: 'Serbus!',
      duration: 5000,
      color: 'green',
      datetime: new Date()
    };
    // this.notificationService.events.emit(notify);
  }

  updateProfile(e: Event): void {
    e.preventDefault();

  }
}
