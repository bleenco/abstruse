import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/shared/auth.service';
import { User, generateUser } from '../../users/shared/user.model';
import { Router, NavigationStart } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  user: User;
  dropdownOpened = false;

  constructor(private auth: AuthService, private elementRef: ElementRef, private router: Router) {
    this.user = generateUser(this.auth.userData);
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

  @HostListener('document:click', ['$event']) onBlur(e: MouseEvent) {
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
