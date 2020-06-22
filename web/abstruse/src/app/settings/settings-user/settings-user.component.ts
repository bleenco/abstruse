import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from 'src/app/shared/providers/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-user',
  templateUrl: './settings-user.component.html',
  styleUrls: ['./settings-user.component.sass']
})
export class SettingsUserComponent implements OnInit, OnDestroy {
  darkTheme: boolean;
  fetching: boolean;
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
