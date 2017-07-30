import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: 'app-settings.component.html'
})
export class AppSettingsComponent implements OnInit {
  loading: boolean;

  constructor() { }

  ngOnInit() {
    // this.notificationService.events.emit(notify);
  }

  updateProfile(e: MouseEvent): void {
    e.preventDefault();
  }
}
