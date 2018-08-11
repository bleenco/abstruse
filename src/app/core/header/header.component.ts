import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { AuthService } from '../../shared/providers/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass']
})
export class HeaderComponent implements OnInit {
  dropdownOpened: boolean;

  constructor(public authService: AuthService, public elementRef: ElementRef) { }

  ngOnInit() {
    this.dropdownOpened = false;
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
