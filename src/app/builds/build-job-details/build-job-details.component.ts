import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';

@Component({
  selector: 'app-build-job-details',
  templateUrl: './build-job-details.component.html',
  styleUrls: ['./build-job-details.component.sass']
})
export class BuildJobDetailsComponent implements OnInit, OnDestroy {
  buildId: number;
  jobId: number;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.buildId = this.route.snapshot.params['id'];
    this.jobId = this.route.snapshot.params['jobid'];
    this.buildService.fetchJob(this.buildId, this.jobId);
  }

  ngOnDestroy() { }
}
