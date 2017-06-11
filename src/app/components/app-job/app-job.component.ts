import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';
import { format } from 'date-fns';

@Component({
  selector: 'app-job',
  templateUrl: 'app-job.component.html'
})
export class AppJobComponent implements OnInit {
  loading: boolean;
  id: number;
  job: any;
  status: string;
  terminalReady: boolean;
  terminalOptions:  { size: 'small' | 'large' };
  terminalInput: any;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.loading = true;
    this.status = 'queued';
    this.terminalOptions = { size: 'large' };
  }

  ngOnInit() {
    Observable.interval(100)
      .map(() => this.terminalReady)
      .takeWhile(x => !x)
      .subscribe(() => { }, err => console.error(err), () => {
        this.route.params.subscribe(params => {
          this.id = params.id;

          this.apiService.getJob(this.id).subscribe(job => {
            this.job = job;
            this.terminalInput = job.log.split('\n').filter(line => line !== '').join('\n');
            this.loading = false;

            this.socketService.outputEvents
              .subscribe(event => {
                if (event.type === 'data') {
                  this.terminalInput = event.data;
                }
              });

            this.socketService.emit({ type: 'subscribeToJobOutput', data: { jobId: this.id } });

            this.updateJobTime();
            setInterval(() => this.updateJobTime(), 1000);

            this.socketService.outputEvents
              .filter(event => event.type === 'process')
              .filter(event => event.job_id === parseInt(<any>this.id, 10))
              .subscribe(event => {
                this.ngZone.run(() => {
                  if (event.data === 'jobStarted') {
                    job.status = 'running';
                    job.end_time = null;
                    job.start_time = new Date().getTime();
                  } else if (event.data === 'jobSucceded') {
                    job.status = 'success';
                    job.end_time = new Date().getTime();
                  } else if (event.data == 'jobFailed') {
                    job.status = 'failed';
                    job.end_time = new Date().getTime();
                  }
                });
              });
            });
          });
        });
  }

  updateJobTime(): void {
    let currentTime = new Date().getTime() - this.socketService.timeSyncDiff;
    if (!this.job.end_time || this.job.status === 'running') {
      this.job.time = format(currentTime - this.job.start_time, 'mm:ss');
    } else {
      this.job.time = format(this.job.end_time - this.job.start_time, 'mm:ss');
    }
  }

  restartJob(): void {
    this.terminalInput = { clear: true };
    this.socketService.emit({ type: 'restartJob', data: { jobId: this.id } });
  }

  terminalOutput(e: any): void {
    if (e === 'ready') {
      this.terminalReady = true;
    }
  }
}
