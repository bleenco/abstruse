import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import { format, distanceInWordsToNow } from 'date-fns';

@Component({
  selector: 'app-repository',
  templateUrl: 'app-repository.component.html'
})
export class AppRepositoryComponent implements OnInit {
  loading: boolean;
  id: string;
  repo: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params.id || null;
      if (!this.id) {
        this.router.navigate(['repositories']);
      } else {
        this.fetch();
      }
    });

    this.socketService.outputEvents.subscribe(event => {
      if (!this.repo || !event.data) {
        return;
      }

      if (event.data === 'jobAdded') {
        this.fetch();
      }

      const index = this.repo.builds.findIndex(build => build.id === event.build_id);
      if (index !== -1) {
        const jobIndex = this.repo.builds[index].jobs.findIndex(job => job.id === event.job_id);
        if (jobIndex !== -1) {
          let status = null;
          switch (event.data) {
            case 'jobSucceded':
              status = 'success';
            break;
            case 'jobQueued':
              status = 'queued';
            break;
            case 'jobStarted':
              status = 'running';
            break;
            case 'jobFailed':
              status = 'failed';
            break;
            case 'jobStopped':
              status = 'failed';
            break;
          }

          this.repo.builds[index].jobs[jobIndex].status = status;
        }
      }
    });
  }

  fetch(): void {
    this.api.getRepository(this.id).subscribe(event => {
      this.repo = event;
      this.loading = false;
      this.updateJobs();
      setInterval(() => this.updateJobs(), 1000);
    });
  }

  updateJobs(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;

    this.repo.builds = this.repo.builds
      .map(build => {
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
      })
      .map(build => {
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
        build.timeInWords = distanceInWordsToNow(build.created_at);
        return build;
      });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }
}
