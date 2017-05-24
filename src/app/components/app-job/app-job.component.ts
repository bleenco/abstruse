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

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {
    this.status = 'queued';
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params.id;

    });
  }
}
