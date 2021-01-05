import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/shared/auth.service';
import { Router, NavigationStart } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';
import { SocketService } from 'src/app/shared/providers/socket.service';
import { ConnectionStates } from 'src/app/shared/models/socket.class';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  dropdownOpened = false;
  onlineStatus = false;

  constructor(
    public auth: AuthService,
    private elementRef: ElementRef,
    private router: Router,
    private socket: SocketService
  ) {
    this.socket.connectionState.pipe(untilDestroyed(this)).subscribe(state => {
      if (state === ConnectionStates.CONNECTED) {
        this.onlineStatus = true;
      } else {
        this.onlineStatus = false;
      }
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationStart),
        untilDestroyed(this)
      )
      .subscribe(() => (this.dropdownOpened = false));
  }

  logout(): void {
    this.auth.logout();
  }

  toggleDropdown(): void {
    this.dropdownOpened = !this.dropdownOpened;
  }

  @HostListener('document:click', ['$event']) onBlur(e: MouseEvent): void {
    if (!this.dropdownOpened) {
      return;
    }
    const userItem: HTMLElement = this.elementRef.nativeElement.querySelector('.user-item');
    if (e.target === userItem || userItem.contains(e.target as Node)) {
      return;
    }
    this.dropdownOpened = false;
  }
}
