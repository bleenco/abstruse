import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const key = 'abstruse-theme';
export type Theme = 'theme-light' | 'theme-dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme$: BehaviorSubject<Theme>;

  constructor() {
    this.theme$ = new BehaviorSubject<Theme>(this.theme);
  }

  set(theme: Theme): void {
    localStorage.setItem(key, theme);
    this.theme$.next(theme);
  }

  toggle(): void {
    this.set(this.theme === 'theme-light' ? 'theme-light' : 'theme-dark');
  }

  private get theme(): Theme {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, 'theme-light');
    }
    return localStorage.getItem(key) as Theme;
  }
}
