import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Job, generateJobModel } from '../shared/build.model';

@Component({
  selector: 'app-builds-job-details',
  templateUrl: './builds-job-details.component.html',
  styleUrls: ['./builds-job-details.component.sass']
})
export class BuildsJobDetailsComponent implements OnInit {
  id: number;
  build_id: number;
  fetching: boolean;
  job: Job;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params.jobid;
    this.build_id = this.route.snapshot.params.id;

    this.fetchJobInfo();
  }

  fetchJobInfo(): void {
    this.fetching = true;
    this.buildService.fetchJobInfo(this.id).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.job = generateJobModel(resp.data);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }
}
