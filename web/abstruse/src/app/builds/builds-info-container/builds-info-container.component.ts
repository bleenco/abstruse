import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Build, Job } from '../shared/build.model';

@Component({
  selector: 'app-builds-info-container',
  templateUrl: './builds-info-container.component.html',
  styleUrls: ['./builds-info-container.component.sass']
})
export class BuildsInfoContainerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() build: Build;
  @Input() job: Job;

  constructor() { }

  ngOnInit() { }

  ngOnDestroy() { }

  ngOnChanges() {
    if (!this.build && this.job) {
      this.build = this.job.build;
    }
  }
}
