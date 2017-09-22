import { Component, OnInit, NgZone, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TimeService } from '../../services/time.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { distanceInWordsToNow, distanceInWordsStrict, format } from 'date-fns';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-build-details',
  templateUrl: 'app-build-details.component.html'
})
export class AppBuildDetailsComponent implements OnInit, OnDestroy {
  loading: boolean;
  id: string;
  build: any;
  status: string;
  timeWords: string;
  totalTime: number;
  previousRuntime: number;
  processingBuild: boolean;
  tag: string = null;
  updateInterval: any;
  subStatus: Subscription;
  sub: Subscription;
  userData: any;
  userId: string | null;
  committerAvatar: string;
  authorAvatar: string;
  nameAuthor: string;
  nameCommitter: string;
  timerSubscription: any = null;
  currentTime: number;
  commitMessage: string;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private timeService: TimeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private router: Router,
    @Inject(DOCUMENT) private document: any,
    private titleService: Title
  ) {
    this.loading = true;
    this.status = 'queued';
    this.currentTime = new Date().getTime();
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.userId = this.userData && this.userData.id || null;

      this.apiService.getBuild(this.id, this.userId).subscribe(build => {
        this.loading = false;
        this.build = build;

        if (this.build.data && this.build.data.ref && this.build.data.ref.startsWith('refs/tags')) {
          this.tag = this.build.data.ref.replace('refs/tags/', '');
        }

        this.setData();

        this.build.jobs.forEach(job => job.time = '00:00');
        this.timeWords = distanceInWordsToNow(this.build.created_at);
        if (this.build.lastBuild) {
          this.previousRuntime = this.build.lastBuild.end_time - this.build.lastBuild.start_time;
        }

        this.status = this.getBuildStatus();
        this.updateJobTimes();

        this.subStatus = this.socketService.outputEvents
          .filter(event => event.type === 'process')
          .subscribe(event => {
            let index = this.build.jobs.findIndex(job => job.id === event.job_id);
            if (index !== -1) {
              if (event.data === 'job started') {
                this.build.jobs[index].status = 'running';
                this.build.jobs[index].end_time = null;
                this.build.jobs[index].start_time = new Date().getTime();
              } else if (event.data === 'job succeded') {
                this.build.jobs[index].status = 'success';
                this.build.jobs[index].end_time = new Date().getTime();
              } else if (event.data === 'job failed' || event.data === 'job stopped') {
                this.build.jobs[index].status = 'failed';
                this.build.jobs[index].end_time = new Date().getTime();
              } else if (event.data === 'job queued') {
                this.build.jobs[index].status = 'queued';
              }

              this.build.jobs[index].processing = false;
              this.status = this.getBuildStatus();
              this.updateJobTimes();
            }
          });

        this.sub = this.socketService.outputEvents
          .filter(event => event.type === 'build restarted' || event.type === 'build stopped')
          .subscribe(event => {
            this.processingBuild = false;
          });
      });
    });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.subStatus) {
      this.subStatus.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.document.getElementById('favicon').setAttribute('href', 'images/favicon.png');
    this.titleService.setTitle('Abstruse CI');
  }

  updateJobTimes(): void {
    if (this.status !== 'running') {
      this.totalTime = Math.max(...this.build.jobs.map(job => job.end_time - job.start_time));
    } else {
      this.totalTime = Math.min(...this.build.jobs
        .filter(job => job.status === 'running').map(job => job.start_time));
    }

    this.build.jobs = this.build.jobs.map(job => {
      const lastRun = job.runs && job.runs[job.runs.length - 1].end_time ?
        job.runs[job.runs.length - 1] : job.runs[job.runs.length - 2];
      if (lastRun) {
        job.lastRunTime = lastRun.end_time - lastRun.start_time;
      }

      return job;
    });
  }

  getBuildStatus(): string {
    let status = 'queued';
    let favicon = 'images/favicon-queued.png';

    if (this.build && this.build.jobs) {
      if (this.build.jobs.findIndex(job => job.status === 'failed') !== -1) {
        status = 'failed';
        favicon = 'images/favicon-error.png';
      }

      if (this.build.jobs.findIndex(job => job.status === 'running') !== -1) {
        status = 'running';
        favicon = 'images/favicon-running.png';
      }

      if (this.build.jobs.length === this.build.jobs.filter(j => j.status === 'success').length) {
        status = 'success';
        favicon = 'images/favicon.png';
      }
    }

    const name = this.build.repository.full_name;
    this.document.getElementById('favicon').setAttribute('href', favicon);
    this.titleService.setTitle(`${name} - ${status}`);

    return status;
  }

  restartJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    const index = this.build.jobs.findIndex(job => job.id === jobId);
    this.build.jobs[index].processing = true;
    this.socketService.emit({ type: 'restartJob', data: { jobId: jobId } });
  }

  stopJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    const index = this.build.jobs.findIndex(job => job.id === jobId);
    this.build.jobs[index].processing = true;
    this.socketService.emit({ type: 'stopJob', data: { jobId: jobId } });
  }

  restartBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    if (this.getBuildStatus() === 'success') {
      let minJobStartTime = Math.min(...this.build.jobs.map(job => job.start_time));
      let maxJobEndTime = Math.max(...this.build.jobs.map(job => job.end_time));
      this.previousRuntime = maxJobEndTime - minJobStartTime;
    }
    this.processingBuild = true;
    this.socketService.emit({ type: 'restartBuild', data: { buildId: id } });
  }

  stopBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.processingBuild = true;
    this.socketService.emit({ type: 'stopBuild', data: { buildId: id } });
  }

  gotoJob(e: MouseEvent, jobId: number): void {
    e.preventDefault();
    e.stopPropagation();

    this.router.navigate(['job', jobId]);
  }

  setData(): void {
    if (this.build.data.commit) {
      this.commitMessage = this.build.data.commit.message;
    } else if (this.build.data.commits) {
      const len = this.build.data.commits.length - 1;
      this.commitMessage = this.build.data.commits[len].message;
    } else if (this.build.data.pull_request && this.build.data.pull_request.title) {
      this.commitMessage = this.build.data.pull_request.title;
    } else if (this.build.data.head_commit) {
      this.commitMessage = this.build.data.head_commit.message;
    }

    if (this.build.data.sha) {
      const data = this.build.data;
      this.committerAvatar = data.committer.avatar_url;
      this.nameCommitter = data.commit.committer.name;
      this.authorAvatar = data.author.avatar_url;
      this.nameAuthor = data.commit.author.name;
    } else if (this.build.data.head_commit) {
      const commit = this.build.data.head_commit;
      this.committerAvatar = this.build.data.sender.avatar_url;
      this.nameCommitter = this.build.data.head_commit.author.name;

      if (commit.author.username !== commit.committer.username) {
        this.nameCommitter = commit.committer.name;

        this.apiService.getGithubUserData(commit.author.username).subscribe((evt: any) => {
          if (evt.status === 200) {
            const body = JSON.parse(evt._body);
            this.authorAvatar = body.avatar_url;
          }
        });
      } else {
        this.authorAvatar = this.committerAvatar;
        this.nameCommitter = this.nameAuthor;
      }
    } else if (this.build.data.pull_request) {
      this.authorAvatar = this.build.data.sender.avatar_url;
      this.committerAvatar = this.authorAvatar;

      this.apiService.getGithubUserData(this.build.data.sender.login).subscribe((evt: any) => {
        if (evt.status === 200) {
          const body = JSON.parse(evt._body);
          this.nameAuthor = body.name;
        }
      });
    }
  }
}
