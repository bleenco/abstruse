import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd } from '@angular/router';
import { SetupService } from '../shared/setup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-setup-progress',
  templateUrl: './setup-progress.component.html',
  styleUrls: ['./setup-progress.component.sass']
})
export class SetupProgressComponent implements OnInit, OnDestroy {
  sub: Subscription;
  progressBar: number;
  route: string;
  step: number;

  constructor(public setup: SetupService) {
    this.progressBar = 0;
    this.route = '/setup';
    this.step = 1;
  }

  ngOnInit() {
    this.route = this.setup.router.url;
    this.setProgress();

    this.sub = this.setup.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.route = event.url;
        this.setProgress();
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private setProgress(): void {
    switch (this.route) {
      case '/setup/check':
        this.progressBar = 0;
        this.step = 1;
        break;
      case '/setup/config':
        this.progressBar = 33.3;
        this.step = 2;
        break;
      case '/setup/user':
        this.progressBar = 66.6;
        this.step = 3;
        break;
      case '/setup/team':
        this.progressBar = 100;
        this.step = 4;
        break;
    }
  }

}
