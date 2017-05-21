import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-builds',
  templateUrl: 'app-builds.component.html'
})
export class AppBuildsComponent implements OnInit {
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

      this.builds = this.builds.map(build => {
        let status = 'queued';
        if (build.jobs.findIndex(job => job.status === 'failed') !== -1) {
          status = 'failed';
        }

        if (status === 'queued' && build.jobs.findIndex(job => job.status === 'running') !== -1) {
          status = 'running';
        }

        if (status === 'queued' && build.jobs.findIndex(job => job.status === 'success') !== -1) {
          status = 'success';
        }

        build.status = status;
        return build;
      });
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

  restartBuild(uuid: number): void {
    this.socketService.emit({ type: 'restartBuild', data: uuid });
  }

  gotoBuild(buildId: number) {
    this.router.navigate(['build', buildId]);
  }
}
