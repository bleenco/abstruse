import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-job',
  templateUrl: 'app-job.component.html'
})
export class AppJobComponent implements OnInit {
  id: number;
  job: any;
  status: string;
  terminalReady: boolean;
  terminalOptions:  { size: 'small' | 'large' };
  terminalInput: string;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {
    this.status = 'queued';
    this.terminalOptions = { size: 'large' };
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params.id;

      this.apiService.getJob(this.id).subscribe(job => {
        this.job = job;

        this.socketService.outputEvents
          .subscribe(event => {
            if (event.type === 'data') {
              this.terminalInput = event.data;
            }
          });

        this.socketService.emit({ type: 'subscribeToJobOutput', data: { jobId: this.id } });
      });
    });
  }

  terminalOutput(e: any): void {
    if (e.ready) {
      this.terminalReady = true;
    }
  }
}
