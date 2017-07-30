import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import { ConfigService } from '../../services/config.service';
import { Subscription } from 'rxjs/Subscription';
import { format, distanceInWordsToNow } from 'date-fns';

@Component({
  selector: 'app-repository',
  templateUrl: 'app-repository.component.html'
})
export class AppRepositoryComponent implements OnInit, OnDestroy {
  loading: boolean;
  sub: Subscription;
  id: string;
  repo: any;
  url: string;
  statusBadge: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private api: ApiService,
    private config: ConfigService
  ) { }

  ngOnInit() {
    this.url = this.config.url;

    this.route.params.subscribe(params => {
      this.id = params.id || null;
      if (!this.id) {
        this.router.navigate(['repositories']);
      } else {
        this.fetch();
      }
    });

    this.sub = this.socketService.outputEvents.subscribe(event => {
      if (!this.repo || !event.data) {
        return;
      }

      if (event.type === 'buildRestarted' || event.type === 'buildStopped') {
        const buildIndex = this.repo.builds.findIndex(build => build.id === event.data);
        this.repo.builds[buildIndex].processingRequest = false;
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
              this.repo.builds[index].jobs[jobIndex].start_time = new Date();
            break;
            case 'jobFailed':
              status = 'failed';
              this.repo.builds[index].jobs[jobIndex].start_time = new Date();
            break;
            case 'jobStopped':
              status = 'failed';
              this.repo.builds[index].jobs[jobIndex].start_time = new Date();
            break;
          }

          this.repo.builds[index].jobs[jobIndex].status = status;

          this.statusBadge = '';
          this.statusBadge = this.url + '/api/repositories/badge/' + this.id;
        }
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  fetch(): void {
    this.api.getRepository(this.id).subscribe(event => {
      this.repo = event;
      this.loading = false;
      this.updateJobs();
      this.statusBadge = '';
      this.statusBadge = this.url + '/api/repositories/badge/' + this.id;
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

  restartBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();
    const buildIndex = this.repo.builds.findIndex(build => build.id === id);
    this.repo.builds[buildIndex].processingRequest = true;
    this.socketService.emit({ type: 'restartBuild', data: { buildId: id } });
  }

  stopBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();
    const buildIndex = this.repo.builds.findIndex(build => build.id === id);
    this.repo.builds[buildIndex].processingRequest = true;
    this.socketService.emit({ type: 'stopBuild', data: { buildId: id } });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }
}
