import { Component, OnInit, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from '../../shared/providers/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit, OnDestroy {
  dropdownOpened: boolean;
  sub: Subscription;

  constructor(
    public authService: AuthService,
    public elementRef: ElementRef,
    public router: Router
  ) { }

  ngOnInit() {
    this.dropdownOpened = false;
    this.sub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.dropdownOpened = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  toggleDropdown(): void {
    this.dropdownOpened = !this.dropdownOpened;
  }

  @HostListener('document:click', ['$event']) onBlur(e: MouseEvent) {
    if (!this.dropdownOpened) {
      return;
    }

    const input = this.elementRef.nativeElement.querySelector('.avatar');

    if (e.target === input) {
      return;
    }

    const container = this.elementRef.nativeElement.querySelector('.header-dropdown-container');
    if (container && container !== e.target && !container.contains(<any>e.target)) {
      this.dropdownOpened = false;
    }
  }

}
