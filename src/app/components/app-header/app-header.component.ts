import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html'
})
export class AppHeaderComponent implements OnInit {
  menuDropped: boolean;
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private config: ConfigService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuDropped = false;
      }
    });
  }

  ngOnInit() {
    this.user = this.authService.getData();
    this.user.avatar = this.config.url + '/' + this.user.avatar;
  }

  toggleMenu() {
    this.menuDropped = !this.menuDropped;
  }

  logout(): void {
    this.authService.logout();
    this.menuDropped = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onBlur(e: MouseEvent) {
    if (!this.menuDropped) {
      return;
    }

    let toggleBtn = this.elementRef.nativeElement.querySelector('.user-item');
    if (e.target === toggleBtn || toggleBtn.contains(<any>e.target)) {
      return;
    }

    let dropMenu: HTMLElement = this.elementRef.nativeElement.querySelector('.nav-dropdown');
    if (dropMenu && dropMenu !== e.target && !dropMenu.contains((<any>e.target))) {
      this.menuDropped = false;
    }
  }
}
