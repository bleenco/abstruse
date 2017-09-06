import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { ApiService } from '../../services/api.service';
import * as AnsiUp from 'ansi_up';

export interface LogType {
  message: string;
  type: 'info' | 'warning' | 'error';
  created_at: Date;
  updated_at: Date;
}

@Component({
  selector: 'app-logs',
  templateUrl: 'app-logs.component.html'
})
export class AppLogsComponent implements OnInit {
  loading: boolean;
  show: 'all' | 'info' | 'warnings' | 'errors';
  limit: number;
  offset: number;
  logs: LogType[];
  au: any;
  fetching: boolean;
  hideMoreButton: boolean;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService
  ) {
    this.loading = true;
    this.show = 'all';
    this.limit = 20;
    this.offset = 0;
    this.logs = [];
  }

  ngOnInit() {
    this.au = new AnsiUp.default();
    this.au.use_classes = true;
    this.fetch();
  }

  fetch(e?: MouseEvent, reset = false): void {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.fetching = true;
    this.apiService.getLogs(this.limit, this.offset, this.show)
      .subscribe(logs => {
        if (!reset) {
          this.logs = this.logs.concat(logs.map(log => {
            log.message = this.au.ansi_to_html(log.message);
            return log;
          }));
        } else {
          this.logs = logs.map(log => {
            log.message = this.au.ansi_to_html(log.message);
            return log;
          });
        }

        this.fetching = false;
        this.loading = false;

        if (logs.length === this.limit) {
          this.offset += 20;
          this.hideMoreButton = false;
        } else {
          this.hideMoreButton = true;
        }
      });
  }

  changeShowType(type: 'all' | 'info' | 'warnings' | 'errors') {
    this.show = type;
    this.offset = 0;
    this.fetch(null, true);
  }
}
