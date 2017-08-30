import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';

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

  constructor(private socketService: SocketService, private apiService: ApiService) { }

  ngOnInit() {
    this.setAvatars();

    if (this.build.data && this.build.data.ref && this.build.data.ref.startsWith('refs/tags/')) {
      this.tag = this.build.data.ref.replace('refs/tags/', '');
    }

    this.socketService.outputEvents
      .filter(x => x.type === 'buildRestarted' || x.type === 'buildStopped')
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

  setAvatars(): void {
    if (this.build.data.head_commit) {
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
  }
}
