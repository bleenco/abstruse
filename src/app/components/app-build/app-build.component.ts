import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-build',
  templateUrl: 'app-build.component.html'
})
export class AppBuildComponent implements OnInit {
  builds: any[];
  // terminalInput: string;
  // resize: { cols: number; rows: number; };

  constructor(private socketService: SocketService, private apiService: ApiService) { }

  ngOnInit() {
    this.socketService.emit({ type: 'data', data: '' });
    this.fetch();
  }

  fetch(): void {
    this.apiService.getBuilds().subscribe(event => {
      this.builds = event;
    });
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
