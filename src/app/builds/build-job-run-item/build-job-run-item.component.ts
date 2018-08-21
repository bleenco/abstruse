import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-build-job-run-item',
  templateUrl: './build-job-run-item.component.html',
  styleUrls: ['./build-job-run-item.component.sass']
})
export class BuildJobRunItemComponent implements OnInit, OnChanges {
  @Input() run: any;
  @Input() num: number;

  runningTime: number;

  constructor() { }

  ngOnInit() {
    this.calculateTime();
  }

  ngOnChanges() {
    this.calculateTime();
  }

  private calculateTime(): void {
    if (!this.run || !this.run.end_time) {
      this.runningTime = null;
    } else {
      this.runningTime = Math.abs(this.run.end_time - this.run.start_time);
    }
  }
}
