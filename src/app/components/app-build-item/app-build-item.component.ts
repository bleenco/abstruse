import { Component, Input, HostBinding, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-build-item',
  templateUrl: 'app-build-item.component.html',
})
export class AppBuildItemComponent {
  @Input() build: any;
  @HostBinding('class') classes = 'column is-12';

  processingRequest: boolean;
  tag: string = null;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    if (this.build.data.ref.startsWith('refs/tags/')) {
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
}
