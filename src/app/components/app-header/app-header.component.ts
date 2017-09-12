import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService, NotificationType } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html'
})
export class AppHeaderComponent implements OnInit {
  menuDropped: boolean;
  notifyDropped: boolean;
  user: any;
  notifications: NotificationType[];

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private config: ConfigService,
    private notificationService: NotificationService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuDropped = false;
      }
    });

    this.notifications = [];
  }

  ngOnInit() {
    this.user = this.authService.getData();
    if (this.user) {
      this.user.avatar = this.config.url + this.user.avatar;
    }

    this.authService.userEvents.subscribe(event => {
      if (event === 'login') {
        this.user = this.authService.getData();
        this.user.avatar = this.config.url + this.user.avatar;
      }
    });

    if (this.user) {
      this.notificationService.notifications
        .distinctUntilChanged()
        .subscribe((notify: NotificationType) => {
          this.notifications.push(notify);
        });

      this.notificationService.sub();
    }
  }

  toggleMenu() {
    this.menuDropped = !this.menuDropped;
  }

  toggleNotify() {
    this.notifyDropped = !this.notifyDropped;
  }

  logout(): void {
    this.authService.logout();
    this.menuDropped = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onBlur(e: MouseEvent) {
    if (!this.menuDropped || !this.notifyDropped) {
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

    let toggleNotify = this.elementRef.nativeElement.querySelector('.notification-item');
    if (e.target === toggleBtn || toggleBtn.contains(<any>e.target)) {
      return;
    }

    let notifyMenu = this.elementRef.nativeElement.querySelector('.notification-dropdown');
    if (notifyMenu && notifyMenu !== e.target && !dropMenu.contains((<any>e.target))) {
      this.notifyDropped = false;
    }
  }
}
