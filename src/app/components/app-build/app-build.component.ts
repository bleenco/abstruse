import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-build',
  templateUrl: 'app-build.component.html'
})
export class AppBuildComponent implements OnInit {
  builds: any[];
  buildDropdowns: boolean[];
  // terminalInput: string;
  // resize: { cols: number; rows: number; };

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetch();

    this.socketService.outputEvents.subscribe(event => {
      if (!this.builds) {
        return;
      }

      const index = this.builds.findIndex(build => build.uuid === event.data.id);
      if (index !== -1) {
        this.builds[index].status = event.data.status;
      }
    });
  }

  fetch(): void {
    this.apiService.getBuilds().subscribe(event => {
      this.builds = event;
      this.buildDropdowns = this.builds.map(build => false);
    });
  }

  toggleDropdown(e: MouseEvent, index: number): void {
    e.preventDefault();
    e.stopPropagation();
    this.buildDropdowns = this.buildDropdowns.map((repo, i) => {
      if (i !== index) {
        return false;
      } else {
        return !repo;
      }
    });
  }

  runBuild(repositoryId: number): void {
    this.apiService.runBuild(repositoryId).subscribe(event => {
      // build runned.
    });
  }

  restartBuild(uuid: number): void {
    this.socketService.emit({ type: 'restartBuild', data: uuid });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }

  // terminalOutput(e: any): void {
  //   if (e === 'ready') {
  //     this.socketService.onMessage().skip(2).subscribe(event => {
  //       if (event.type === 'terminalOutput') {
  //         this.terminalInput = event.data;
  //       } else if (event.type === 'terminalExit') {
  //         if (event.data === 0) {

  //         }
  //       }
  //     });

  //     this.socketService.emit({ type: 'data', data: 'runBuild' });
  //     if (this.resize) {
  //       this.socketService.emit({ type: 'resize', data: {
  //         cols: this.resize.cols, rows: this.resize.rows
  //       }});
  //     }
  //   } else if (e && e.type && e.type === 'resize') {
  //     this.resize = { cols: e.cols, rows: e.rows };
  //   }
  // }
}
