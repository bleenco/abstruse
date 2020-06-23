import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  opened: boolean;

  constructor() {}

  open(): void {
    this.opened = true;
  }

  close(): void {
    this.opened = false;
  }
}
