import { Component, HostListener, ElementRef, OnInit, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ConfigService } from '../../services/config.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService, NotificationType } from '../../services/notification.service';
import * as pkgJson from '../../../../package.json';

@Component({
  selector: 'app-header',
  templateUrl: 'app-header.component.html'
})
export class AppHeaderComponent implements OnInit {
  menuDropped: boolean;
  notifyDropped: boolean;
  user: any;
  notifications: NotificationType[];
  version: string;
  viewport: any;
  view: 'mobile' | 'desktop';
  demo: boolean;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private config: ConfigService,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuDropped = false;
      }
    });

    this.notifications = [];
    this.version = (<any>pkgJson).version;
    this.demo = false;
  }

  ngOnInit() {
    this.user = this.authService.getData();
    if (this.user) {
      this.user.avatar = this.config.url + this.user.avatar;
      this.socketService.emit({ type: 'userId', data: this.user.id });
    } else {
      this.apiService.configDemo().subscribe(demo => this.demo = demo);
    }

    this.authService.userEvents.subscribe(event => {
      if (event === 'login') {
        this.user = this.authService.getData();
        this.user.avatar = this.config.url + this.user.avatar;
        this.socketService.emit({ type: 'userId', data: this.user.id });
      }
    });

    if (this.user) {
      this.notificationService.notifications
        .pipe(distinctUntilChanged())
        .subscribe((notify: NotificationType) => {
          this.notifications.push(notify);
        });

      this.notificationService.sub();
    }

    this.viewport = this.document.querySelector('head > [name="viewport"]');
    this.view = 'mobile';
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

  switchToDesktopView(): void {
    this.renderer.setAttribute(this.viewport, 'content', 'width=1024');
    this.view = 'desktop';
  }

  switchToMobileView(): void {
    this.renderer.setAttribute(this.viewport, 'content', 'width=device-width, initial-scale=1');
    this.view = 'mobile';
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

    if (e.target === toggleBtn || toggleBtn.contains(<any>e.target)) {
      return;
    }

    let notifyMenu = this.elementRef.nativeElement.querySelector('.notification-dropdown');
    if (notifyMenu && notifyMenu !== e.target && !dropMenu.contains((<any>e.target))) {
      this.notifyDropped = false;
    }
  }
}
