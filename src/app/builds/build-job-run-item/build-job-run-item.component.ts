import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { TimeService } from 'src/app/shared/providers/time.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-build-job-run-item',
  templateUrl: './build-job-run-item.component.html',
  styleUrls: ['./build-job-run-item.component.sass']
})
export class BuildJobRunItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() run: any;
  @Input() num: number;
  @Input() index: number;

  runningTime: number;
  currentTime: number;
  sub: Subscription;

  constructor(public timeService: TimeService) { }

  ngOnInit() {
    this.sub = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.calculateTime();
    });

    if ((this.run.status === 'running' || this.run.status === 'queued') && this.index !== 0) {
      this.run.status = 'failed';
    }
  }

  ngOnChanges() {
    this.calculateTime();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private calculateTime(): void {
    if (!this.run) {
      this.runningTime = null;
    } else if (this.run.status === 'running') {
      this.runningTime = this.currentTime - this.run.start_time;
    } else {
      this.runningTime = this.run.end_time - this.run.start_time;
    }
  }
}
