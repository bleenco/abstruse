import { Injectable, Provider } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs/observable/timer';
import { share } from 'rxjs/operators';

@Injectable()
export class TimeService {
  timer: Observable<any>;

  constructor() {
    this.timer = timer(1000, 1000);
  }

  getCurrentTime(): Observable<any> {
    return new Observable(observer => {
      const sub = this.timer.subscribe(() => {
        observer.next(new Date().getTime());
      });

      return () => {
        sub.unsubscribe();
      };
    }).pipe(share());
  }
}

export const TimeServiceProvider: Provider = {
  provide: TimeService, useClass: TimeService
};
