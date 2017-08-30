import { Pipe, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../services/socket.service';
import { format } from 'date-fns';

@Pipe({
  name: 'timeDurationRaw',
  pure: false
})
export class TimeDurationRawPipe extends AsyncPipe {
  currentTime: number;
  value: number;
  timer: Observable<number>;

  constructor(private ref: ChangeDetectorRef, private socket: SocketService) {
    super(ref);
  }

  transform(obj: any, args?: any[]): any {
    if (obj) {
      this.value = obj;
      if (!this.timer) {
        this.timer = this.getTimer();
      }

      return super.transform(this.timer);
    }
  }

  private getTimer(): Observable<number> {
    this.syncTime();

    return Observable
      .interval(1000)
      .startWith(0)
      .map(() => {
        if (this.currentTime) {
          this.currentTime += 1000;
          return this.currentTime - this.value;
        } else {
          return this.value;
        }
      });
  }

  private syncTime(): void {
    this.currentTime = new Date().getTime() - this.socket.timeSyncDiff;
  }
}
