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
  repoid: number;
  buildid: number;
  jobid: number;
  fetching: boolean;
  job: Job;
  sub: Subscription;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.repoid = this.route.snapshot.params.repoid;
    this.buildid = this.route.snapshot.params.buildid;
    this.jobid = this.route.snapshot.params.jobid;

    this.fetchJobInfo();

    this.sub = this.buildService.jobEvents().subscribe((ev: SocketEvent) => {
      this.updateJobFromEvent(ev);
    });
  }

  ngOnDestroy(): void {
    this.buildService.unsubscribeFromJobEvents({ job_id: this.jobid });
    this.sub.unsubscribe();
  }

  fetchJobInfo(): void {
    this.fetching = true;
    this.buildService.fetchJobInfo(this.jobid).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.job = generateJobModel(resp.data);
        this.buildService.subscribeToJobEvents({ job_id: this.jobid });
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }

  updateJobFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data) {
      return;
    }

    if (ev.data.start_time) {
      this.job.start_time = ev.data.start_time;
    }
    if (ev.data.end_time) {
      this.job.end_time = ev.data.end_time;
    }
    if (ev.data.status) {
      this.job.status = ev.data.status;
    }
    if (ev.data.log) {
      this.job.log = ev.data.log;
    }
  }
}
