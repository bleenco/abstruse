import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import { TimeService } from '../../services/time.service';
import { distanceInWordsToNow } from 'date-fns';

@Component({
  selector: 'app-build-item',
  templateUrl: 'app-build-item.component.html',
})
export class AppBuildItemComponent implements OnInit {
  @Input() build: any;
  @HostBinding('class') classes = 'column is-12';

  processingRequest: boolean;
  tag: string = null;
  committerAvatar: string;
  authorAvatar: string;
  name: string;
  timerSubscription: any = null;
  currentTime: number;
  buildCreated: string;
  commitMessage: string;
  dateTime: string;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private timeService: TimeService) {
      this.currentTime = new Date().getTime();
      this.buildCreated = '';
    }

  ngOnInit() {
    this.setData();

    if (this.build.data && this.build.data.ref && this.build.data.ref.startsWith('refs/tags/')) {
      this.tag = this.build.data.ref.replace('refs/tags/', '');
    }

    this.socketService.outputEvents
      .filter(x => x.type === 'build restarted' || x.type === 'build stopped')
      .subscribe(e => this.processingRequest = false);
  }

  restartBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.processingRequest = true;
    this.socketService.emit({ type: 'restartBuild', data: { buildId: id } });
  }

  stopBuild(e: MouseEvent, id: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.processingRequest = true;
    this.socketService.emit({ type: 'stopBuild', data: { buildId: id } });
  }

  setData(): void {
    const data = this.build.data;

    this.dateTime = data.pull_request && data.pull_request.updated_at ||
      data.commit && data.commit.author && data.commit.author.date ||
      data.commits && data.commits[data.commits.length - 1] && data.commits[data.commits.length - 1].timestamp ||
      null;

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
      this.name = data.commit.committer.name;
      this.authorAvatar = data.author.avatar_url;
    } else if (this.build.data.head_commit) {
      const commit = this.build.data.head_commit;
      this.committerAvatar = this.build.data.sender.avatar_url;
      this.name = this.build.data.head_commit.author.name;

      if (commit.author.username !== commit.committer.username) {
        this.apiService.getGithubUserData(commit.author.username).subscribe((evt: any) => {
          if (evt.status === 200) {
            const body = JSON.parse(evt._body);
            this.authorAvatar = body.avatar_url;
          }
        });
      } else {
        this.authorAvatar = this.committerAvatar;
      }
    } else if (this.build.data.pull_request) {
      this.authorAvatar = this.build.data.sender.avatar_url;
      this.committerAvatar = this.authorAvatar;

      this.apiService.getGithubUserData(this.build.data.sender.login).subscribe((evt: any) => {
        if (evt.status === 200) {
          const body = JSON.parse(evt._body);
          this.name = body.name;
        }
      });
    }

    // bitbucket
    if (this.build.data.actor) {
      this.authorAvatar = this.build.data.actor.links.avatar.href;
    }

    if (this.build.data.push) {
      this.commitMessage = this.build.data.push.changes[0].commits[0].message;
      this.dateTime = this.build.data.push.changes[0].commits[0].date;
      this.committerAvatar = this.build.data.push.changes[0].commits[0].author.user.links.avatar.href;
    }

    // gitlab
    if (data.user_avatar) {
      this.authorAvatar = data.user_avatar;
      this.commitMessage = data.commits[0].message;
      this.dateTime = data.commits[0].timestamp;
      this.committerAvatar = this.authorAvatar;
    }

    this.timerSubscription = this.timeService.getCurrentTime().subscribe(time => {
      this.currentTime = time;
      this.buildCreated = distanceInWordsToNow(this.dateTime);
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
