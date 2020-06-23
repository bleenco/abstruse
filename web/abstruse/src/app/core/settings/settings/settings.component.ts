import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { SettingsService } from 'src/app/shared/providers/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  overlay: HTMLElement;
  tab: 'user' | 'appearance' | 'teams';

  constructor(private elementRef: ElementRef, private settings: SettingsService) {}

  ngOnInit(): void {
    this.tab = 'user';
    this.overlay = this.elementRef.nativeElement.querySelector('.settings-overlay');
  }

  close(): void {
    this.overlay.classList.add('out');
    setTimeout(() => {
      this.settings.close();
      this.overlay.classList.remove('out');
    }, 300);
  }

  @HostListener('document:keydown', ['$event']) onKeyUp(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      this.close();
    }
  }
}
