import { Component, OnInit, Input } from '@angular/core';
import { Job, Build } from '../shared/build.model';
import { BuildsService } from '../shared/builds.service';

@Component({
  selector: 'app-builds-job-list-item',
  templateUrl: './builds-job-list-item.component.html',
  styleUrls: ['./builds-job-list-item.component.sass']
})
export class BuildsJobListItemComponent implements OnInit {
  @Input() job: Job;
  @Input() build: Build;

  processing: boolean;

  constructor(public buildsService: BuildsService) { }

  ngOnInit() { }

  restartJob(): void {
    this.processing = true;
    this.buildsService.restartJob(this.job.id)
      .subscribe(resp => {
        console.log(resp);
      }, err => {
        this.processing = false;
        console.error(err);
      }, () => {
        this.processing = false;
      });
  }

  stopJob(): void {
    this.processing = true;
    this.buildsService.stopJob(this.job.id)
      .subscribe(resp => {
        console.log(resp);
      }, err => {
        this.processing = false;
        console.error(err);
      }, () => {
        this.processing = false;
      });
  }
}
