import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/app/shared/providers/theme.service';

@Component({
  selector: 'app-settings-appearance',
  templateUrl: './settings-appearance.component.html',
  styleUrls: ['./settings-appearance.component.sass']
})
export class SettingsAppearanceComponent implements OnInit, OnDestroy {
  darkTheme: boolean;
  sub: Subscription;

  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this.sub = this.themeService.theme$.subscribe(theme => {
      this.darkTheme = theme === 'theme-dark';
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onChange(): void {
    this.themeService.set(this.darkTheme ? 'theme-dark' : 'theme-light');
  }
}
