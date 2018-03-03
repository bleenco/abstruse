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
    return new Observable(observer => this.timer.subscribe(() => {
      observer.next(new Date().getTime());
    }))
      .pipe(share());
  }
}

export let TimeServiceProvider: Provider = {
  provide: TimeService, useClass: TimeService
};
