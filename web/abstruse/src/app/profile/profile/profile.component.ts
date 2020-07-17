import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {
  title!: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setTitle();
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.setTitle();
      });
  }

  private setTitle(): void {
    switch (this.router.url) {
      case '/profile/settings':
        this.title = 'Settings';
        break;
      case '/profile/security':
        this.title = 'Security';
        break;
      case '/profile/sessions':
        this.title = 'Active Sessions';
        break;
    }
  }
}
