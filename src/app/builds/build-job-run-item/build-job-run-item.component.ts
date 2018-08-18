import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-build-job-run-item',
  templateUrl: './build-job-run-item.component.html',
  styleUrls: ['./build-job-run-item.component.sass']
})
export class BuildJobRunItemComponent implements OnInit {
  @Input() run: any;
  @Input() num: number;

  runningTime: number;

  constructor() { }

  ngOnInit() {
    this.runningTime = Math.abs(this.run.end_time - this.run.start_time);
  }
}
