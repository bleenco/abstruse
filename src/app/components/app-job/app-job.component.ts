import { Component, OnInit, OnDestroy, NgZone, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { TimeService } from '../../services/time.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { format, distanceInWordsToNow, distanceInWordsStrict } from 'date-fns';

@Component({
  selector: 'app-job',
  templateUrl: 'app-job.component.html'
})
export class AppJobComponent implements OnInit, OnDestroy {
  loading: boolean;
  termSub: Subscription;
  sub: Subscription;
  id: number;
  job: any;
  jobRun: any;
  terminalReady: boolean;
  terminalOptions:  { size: 'small' | 'large' };
  terminalInput: any;
  timeWords: string;
  previousRuntime: number;
  processing: boolean;
  sshd: string;
  vnc: string;
  tag: string = null;
  userData: any;
  userId: string | null;
  committerAvatar: string;
  authorAvatar: string;
  nameAuthor: string;
  nameCommitter: string;
  timerSubscription: any = null;
  currentTime: number;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private timeService: TimeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private document: any,
    private titleService: Title
  ) {
    this.currentTime = new Date().getTime();
    this.loading = true;
    this.terminalOptions = { size: 'large' };
    this.id = null;
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.userId = this.userData && this.userData.id || null;

    this.termSub = this.socketService.outputEvents
      .subscribe(event => {
        if (event.type === 'data') {
          this.ngZone.run(() => this.terminalInput = event.data);
        } else if (event.type === 'job stopped' && event.data === this.id) {
          this.processing = false;
        } else if (event.type === 'job restarted' && event.data === this.id) {
          this.processing = false;
        } else if (event.type === 'exposed port') {
          if (parseInt(event.data.split(':')[0], 10) === 22) {
            this.sshd = `${document.location.hostname}:${event.data.split(':')[1]}`;
          } else if (parseInt(event.data.split(':')[0], 10) === 5900) {
            this.vnc = `${document.location.hostname}:${event.data.split(':')[1]}`;
          }
        }
      });

    this.sub = this.socketService.outputEvents
      .filter(event => event.type === 'process')
      .filter(event => event.job_id === parseInt(<any>this.id, 10))
      .subscribe(event => {
        if (!this.jobRun) {
          return;
        }

        if (event.data === 'job started') {
          this.jobRun.status = 'running';
          this.jobRun.end_time = null;
          this.jobRun.start_time = new Date().getTime();
        } else if (event.data === 'job succeded') {
          this.jobRun.status = 'success';
          this.jobRun.end_time = new Date().getTime();
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        } else if (event.data == 'job failed') {
          this.jobRun.status = 'failed';
          this.jobRun.end_time = new Date().getTime();
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        }

        this.setFavicon();
      });

    this.route.params.subscribe(params => {
      this.id = params.id;

      this.apiService.getJob(this.id, this.userId).subscribe(job => {
        this.job = job;

        this.setAvatars();

        if (this.job.build.data.ref && this.job.build.data.ref.startsWith('refs/tags/')) {
          this.tag = this.job.build.data.ref.replace('refs/tags/', '');
        }

        this.jobRun = job.runs[job.runs.length - 1];
        this.terminalInput = this.jobRun.log;
        this.timeWords = distanceInWordsToNow(job.build.created_at);
        this.setFavicon();
        this.loading = false;
        const lastRun = job.runs && job.runs[job.runs.length - 1].end_time ?
        job.runs[job.runs.length - 1] : job.runs[job.runs.length - 2];
        if (lastRun) {
          this.previousRuntime = lastRun.end_time - lastRun.start_time;
        }

        this.socketService.emit({ type: 'subscribeToJobOutput', data: { jobId: this.id } });
      });
    });

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
    });
  }

  ngOnDestroy() {
    if (this.termSub) {
      this.termSub.unsubscribe();
    }

    if (this.sub) {
      this.sub.unsubscribe();
    }

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.document.getElementById('favicon').setAttribute('href', 'images/favicon.png');
    this.titleService.setTitle('Abstruse CI');
  }

  setFavicon(): void {
    let favicon;
    switch (this.jobRun.status) {
      case 'queued': favicon = 'images/favicon-queued.png'; break;
      case 'failed': favicon = 'images/favicon-error.png'; break;
      case 'running': favicon = 'images/favicon-running.png'; break;
      case 'success': favicon = 'images/favicon.png'; break;
      default: favicon = 'images/favicon.png'; break;
    }

    const name = this.job.build.repository.full_name;
    const status = this.jobRun.status;
    this.titleService.setTitle(`${name} - ${status}`);
    this.document.getElementById('favicon').setAttribute('href', favicon);
  }

  restartJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.terminalInput = { clear: true };
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.socketService.emit({ type: 'restartJob', data: { jobId: this.id } });
  }

  restartJobWithSSH(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.terminalInput = { clear: true };
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.socketService.emit({ type: 'restartJobWithSshAndVnc', data: { jobId: this.id } });
  }

  stopJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.socketService.emit({ type: 'stopJob', data: { jobId: this.id } });
  }

  terminalOutput(e: any): void {
    if (e === 'ready') {
      this.terminalReady = true;
    }
  }

  setAvatars(): void {
    if (this.job.build.data.head_commit) {
      const commit = this.job.build.data.head_commit;
      this.committerAvatar = this.job.build.data.sender.avatar_url;
      this.nameAuthor = this.job.build.data.head_commit.author.name;

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
    } else if (this.job.build.data.pull_request) {
      this.authorAvatar = this.job.build.data.sender.avatar_url;
      this.committerAvatar = this.authorAvatar;

      this.apiService.getGithubUserData(this.job.build.data.sender.login).subscribe((evt: any) => {
        if (evt.status === 200) {
          const body = JSON.parse(evt._body);
          this.nameAuthor = body.name;
        }
      });
    }
  }
}
