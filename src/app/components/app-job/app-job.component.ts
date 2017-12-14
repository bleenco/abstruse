import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
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
import * as Clipboard from 'clipboard';

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
  commitMessage: string;
  dateTime: string;
  dateTimeToNow: string;
  debug = false;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private timeService: TimeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    private titleService: Title
  ) {
    this.currentTime = new Date().getTime();
    this.loading = true;
    this.terminalOptions = { size: 'large' };
    this.id = null;
    this.sshd = null;
    this.vnc = null;
  }

  ngOnInit() {
    this.userData = this.authService.getData();
    this.userId = this.userData && this.userData.id || null;
    this.id = this.route.snapshot.params.id;

    this.termSub = this.socketService.outputEvents
      .subscribe(event => {
        if (event.type === 'data' || event.type === 'exit' || event.type === 'container' || event.type === 'jobLog') {
          if (Number(event.job_id) === Number(this.id) || event.type === 'jobLog') {
            this.terminalInput = event.data;
          }
        } else if (event.type === 'job stopped' && event.data === this.id) {
          this.processing = false;
        } else if (event.type === 'job restarted' && event.data === this.id) {
          this.processing = false;
        } else if (event.type === 'exposed ports') {
          const portData = event.data && event.data.info || null;

          if (portData && portData['22/tcp']) {
            const port = portData['22/tcp'][0].HostPort;
            this.sshd = `${document.location.hostname}:${port}`;
          }

          if (portData && portData['5900/tcp']) {
            const port = portData['5900/tcp'][0].HostPort;
            this.vnc = `${document.location.hostname}:${port}`;
          }
        } else if (event.type === 'debug') {
          const debug = event.data || 'false';
          this.debug = debug === 'true';
        }
      });

    this.socketService.emit({ type: 'subscribeToJobOutput', data: { jobId: this.id } });

    this.sub = this.socketService.outputEvents
      .filter(event => event.type === 'process')
      .filter(event => Number(event.job_id) === Number(this.id))
      .subscribe(event => {
        if (!this.jobRun) {
          return;
        }

        if (event.data === 'job started') {
          this.jobRun.status = 'running';
          this.jobRun.end_time = null;
          this.jobRun.start_time = event.additionalData;
        } else if (event.data === 'job succeded') {
          this.jobRun.status = 'success';
          this.jobRun.end_time = event.additionalData;
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        } else if (event.data === 'job failed') {
          this.jobRun.status = 'failed';
          this.jobRun.end_time = event.additionalData;
          this.previousRuntime = this.jobRun.end_time - this.jobRun.start_time;
        }

        this.setFavicon();
      });

    this.apiService.getJob(this.id, this.userId).subscribe(job => {
      this.job = job;

      this.setData();

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
    });

    const clipboard = new Clipboard('.code-copy');
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

    if (this.document.getElementById('favicon')) {
      this.document.getElementById('favicon').setAttribute('href', 'images/favicon.png');
    }

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
    if (this.document.getElementById('favicon')) {
      this.document.getElementById('favicon').setAttribute('href', favicon);
    }
  }

  restartJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.debug = false;
    this.socketService.emit({ type: 'restartJob', data: { jobId: this.id } });
    this.terminalInput = { clear: true };
  }

  stopJob(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.processing = true;
    this.sshd = null;
    this.vnc = null;
    this.debug = false;
    this.socketService.emit({ type: 'stopJob', data: { jobId: this.id } });
  }

  debugMode(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.debug = !this.debug;
    this.socketService.emit({ type: 'debugJob', data: { jobId: this.id, debug: this.debug } });
  }

  terminalOutput(e: any): void {
    if (e === 'ready') {
      this.terminalReady = true;
    }
  }

  setData(): void {
    const data = this.job.build.data;

    this.dateTime = data.pull_request && data.pull_request.updated_at ||
      data.commit && data.commit.author && data.commit.author.date ||
      data.commits && data.commits[data.commits.length - 1] && data.commits[data.commits.length - 1].timestamp ||
      data.head_commit && data.head_commit.timestamp ||
      null;

    if (this.job.build.repository.repository_provider === 'github') {
      if (this.job.build.data.commit) {
        this.commitMessage = this.job.build.data.commit.message;
      } else if (this.job.build.data.commits && this.job.build.data.commits.length > 0) {
        const len = this.job.build.data.commits.length - 1;
        this.commitMessage = this.job.build.data.commits[len].message;
      } else if (this.job.build.data.pull_request && this.job.build.data.pull_request.title) {
        this.commitMessage = this.job.build.data.pull_request.title;
      } else if (this.job.build.data.head_commit) {
        this.commitMessage = this.job.build.data.head_commit.message;
      }

      if (this.job.build.data.sha) {
        const data = this.job.build.data;
        this.committerAvatar = data.committer.avatar_url;
        this.nameCommitter = data.commit.committer.name;
        this.authorAvatar = data.author.avatar_url;
        this.nameAuthor = data.commit.author.name;
      } else if (this.job.build.data.head_commit) {
        const commit = this.job.build.data.head_commit;
        this.committerAvatar = this.job.build.data.sender.avatar_url;
        this.nameAuthor = this.job.build.data.head_commit.author.name;
        this.nameCommitter = this.job.build.data.head_commit.committer.name;

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

        this.apiService.getGithubUserData(this.job.build.data.pull_request.user.login).subscribe((evt: any) => {
          if (evt.status === 200) {
            const body = JSON.parse(evt._body);
            this.nameCommitter = body.name;
          }
        });
      }
    } else if (this.job.build.repository.repository_provider === 'bitbucket') {
      // bitbucket
      if (this.job.build.data.actor) {
        this.authorAvatar = this.job.build.data.actor.links.avatar.href;
        this.nameAuthor = this.job.build.data.actor.display_name;
      }

      if (this.job.build.data.push) {
        this.commitMessage = this.job.build.data.push.changes[0].commits[0].message;
        this.dateTime = this.job.build.data.push.changes[0].commits[0].date;
        this.committerAvatar = this.job.build.data.push.changes[0].commits[0].author.user.links.avatar.href;
        this.nameCommitter = this.job.build.data.push.changes[0].commits[0].author.user.display_name;
      } else if (this.job.build.data.pullrequest) {
        this.commitMessage = data.pullrequest.description;
        this.dateTime = data.pullrequest.updated_on;
        this.committerAvatar = data.pullrequest.author.links.avatar.href;
        this.nameAuthor = data.pullrequest.author.display_name;
        this.nameCommitter = this.nameAuthor;
      }
    } else if (this.job.build.repository.repository_provider === 'gitlab') {
      // gitlab
      if (data.commit) {
        this.dateTime = data.commit.created_at;
        this.commitMessage = data.commit.message;
        this.nameCommitter = data.commit.committer_name;
        this.nameAuthor = data.commit.author_name;

        this.apiService.customGet(this.job.build.repository.api_url + '/users', {
          username: this.job.build.repository.user_login
        }).subscribe(data => {
          this.authorAvatar = data[0].avatar_url;
        });
      } else if (data.user_avatar) {
        this.authorAvatar = data.user_avatar;
        this.commitMessage = data.commits[0].message;
        this.dateTime = data.commits[0].timestamp;
        this.committerAvatar = this.authorAvatar;
        this.nameAuthor = data.user_name;
        this.nameCommitter = data.commits[0].author.name;
      } else if (data.object_attributes) {
        this.authorAvatar = data.user.avatar_url;
        this.commitMessage = data.object_attributes.last_commit.message;
        this.dateTime = data.object_attributes.last_commit.timestamp;
        this.committerAvatar = this.authorAvatar;
        this.nameAuthor = data.user.name;
        this.nameCommitter = data.object_attributes.last_commit.author.name;
      }
    } else if (this.job.build.repository.repository_provider === 'gogs') {
      // gogs
      if (data.sender && data.pusher) {
        this.authorAvatar = data.pusher.avatar_url;
        this.nameAuthor = data.pusher.username;
        this.commitMessage = data.commits[0].message;
        this.dateTime = data.commits[0].timestamp;
        this.committerAvatar = data.sender.avatar_url;
        this.nameCommitter = data.sender.username;
      }
    }

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.dateTimeToNow = distanceInWordsToNow(this.dateTime);
    });
  }
}
