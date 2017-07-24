import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-builds',
  templateUrl: 'app-builds.component.html'
})
export class AppBuildsComponent implements OnInit {
  loading: boolean;
  builds: any[];

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.builds = [];
    this.loading = true;
  }

  ngOnInit() {
    this.fetch();

    this.socketService.outputEvents.subscribe(event => {
      if (!this.builds || !event.data) {
        return;
      }

      if (event.data === 'jobAdded') {
        this.fetch();
      }

      const index = this.builds.findIndex(build => build.id === event.data.id);
      if (index !== -1) {
        this.builds[index].status = event.data.status;
      }
    });
  }

  fetch(): void {
    this.apiService.getBuilds().subscribe(builds => {
      this.builds = builds;

      this.builds = this.builds.map(build => {
        let status = 'queued';
        if (build.jobs.findIndex(job => job.status === 'failed') !== -1) {
          status = 'failed';
        }

        if (build.jobs.findIndex(job => job.status === 'running') !== -1) {
          status = 'running';
        }

        if (build.jobs.length === build.jobs.filter(job => job.status === 'success').length) {
          status = 'success';
        }

        build.status = status;
        return build;
      });

      this.updateJobTimes();
      setInterval(() => this.updateJobTimes(), 1000);

      this.loading = false;
    });
  }

  updateJobTimes(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;

    this.builds = this.builds.map(build => {
      build.jobs = build.jobs.map(job => {
        if (!job.end_time || job.status === 'running') {
          job.time = format(currentTime - job.start_time, 'mm:ss');
        } else {
          job.time = format(job.end_time - job.start_time, 'mm:ss');
        }
        return job;
      });

      build.totalTime = format(Math.max(...build.jobs.map(job => {
        let date = new Date();
        let splitted = job.time.split(':');
        date.setUTCMinutes(splitted[0]);
        date.setUTCSeconds(splitted[1]);
        return date;
      })), 'mm:ss');

      return build;
    });
  }

  restartBuild(id: number): void {
    this.socketService.emit({ type: 'restartBuild', data: id });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }
}
