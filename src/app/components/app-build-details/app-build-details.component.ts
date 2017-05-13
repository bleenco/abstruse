import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-build-details',
  templateUrl: 'app-build-details.component.html'
})
export class AppBuildDetailsComponent implements OnInit {
  uuid: string;
  terminalReady: boolean;
  terminalInput: string;
  resize: { cols: number; rows: number; };

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.uuid = params.id;
    });

    this.socketService.outputEvents.subscribe(event => {
      if (!this.terminalReady) {
        return;
      }

      if (this.uuid === event.data.id) {
        this.terminalInput = event.data.data;
      }
    });
  }

  runBuild(repositoryId: number): void {
    this.apiService.runBuild(repositoryId).subscribe(event => {
      // build runned.
    });
  }

  restartBuild(buildId: number): void {
    this.socketService.emit({ type: 'restartBuild', data: buildId });
  }

  terminalOutput(e: any): void {
    if (e === 'ready') {
      this.terminalReady = true;
      this.socketService.emit({ type: 'getLog', data: this.uuid });
    }
  }
}
