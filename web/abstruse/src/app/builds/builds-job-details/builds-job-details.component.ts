import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Job, generateJobModel } from '../shared/build.model';
import { Subscription } from 'rxjs';
import { SocketEvent } from 'src/app/shared/models/socket.model';

@Component({
  selector: 'app-builds-job-details',
  templateUrl: './builds-job-details.component.html',
  styleUrls: ['./builds-job-details.component.sass']
})
export class BuildsJobDetailsComponent implements OnInit, OnDestroy {
  id: number;
  build_id: number;
  fetching: boolean;
  job: Job;
  sub: Subscription;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params.jobid;
    this.build_id = this.route.snapshot.params.id;

    this.fetchJobInfo();

    this.sub = this.buildService.jobEvents().subscribe((ev: SocketEvent) => {

    });
  }

  ngOnDestroy(): void {
    this.buildService.unsubscribeFromJobEvents({ job_id: this.id });
    this.sub.unsubscribe();
  }

  fetchJobInfo(): void {
    this.fetching = true;
    this.buildService.fetchJobInfo(this.id).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.job = generateJobModel(resp.data);
        this.buildService.subscribeToJobEvents({ job_id: this.id });
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }

  updateJobFromEvent(ev: SocketEvent): void {
    if (!this.job) {
      return;
    }

    this.job.start_time = ev.data.start_time;
    this.job.end_time = ev.data.end_time;
    this.job.status = ev.data.status;
  }
}
