import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Build } from '../shared/build.model';
import { TimeService } from 'src/app/shared/providers/time.service';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/shared/providers/data.service';
import { fadeAnimation } from 'src/app/core/shared/animations';

@Component({
  selector: 'app-build-item',
  templateUrl: './build-item.component.html',
  styleUrls: ['./build-item.component.sass'],
  animations: [fadeAnimation]
})
export class BuildItemComponent implements OnInit, OnDestroy {
  @Input() build: Build;

  isMenuOpened: boolean;
  currentTime: number;
  timerSubscription: Subscription;

  constructor(
    public timeService: TimeService,
    public dataService: DataService
  ) { }

  ngOnInit() {
    this.currentTime = new Date().getTime();
    this.subscribeToTimer();
  }

  ngOnDestroy() {
    this.unsubscribeFromTimer();
  }

  toggleMenu(ev: MouseEvent): void {
    ev.stopPropagation();
    this.isMenuOpened = !this.isMenuOpened;
  }

  restartBuild(): void {
    this.isMenuOpened = false;

    this.build.processing = true;
    this.dataService.socketInput.emit({ type: 'restartBuild', data: { buildId: this.build.id } });
  }

  stopBuild(): void {
    this.isMenuOpened = false;

    this.build.processing = true;
    this.dataService.socketInput.emit({ type: 'stopBuild', data: { buildId: this.build.id } });
  }

  private subscribeToTimer(): void {
    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  private unsubscribeFromTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
