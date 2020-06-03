import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { Build, Job } from '../shared/build.model';

@Component({
  selector: 'app-builds-job-details',
  templateUrl: './builds-job-details.component.html',
  styleUrls: ['./builds-job-details.component.sass']
})
export class BuildsJobDetailsComponent implements OnInit {
  buildid: number;
  jobid: number;
  fetching: boolean;
  job: Job;

  constructor(
    private activatedRoute: ActivatedRoute,
    private buildsServie: BuildsService
  ) { }

  ngOnInit(): void {
    this.buildid = Number(this.activatedRoute.snapshot.paramMap.get('buildid'));
    this.jobid = Number(this.activatedRoute.snapshot.paramMap.get('jobid'));
    this.findJob();
  }

  findJob(): void {
    this.fetching = true;
    this.buildsServie.findJob(this.jobid)
      .subscribe(job => {
        this.job = job;
      }, err => {
        this.fetching = false;
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }
}
