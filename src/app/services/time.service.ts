import { Injectable, Provider } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class TimeService {
  timer: Observable<any>;

  constructor() {
    this.timer = Observable.timer(1000, 1000);
  }

  getCurrentTime(): Observable<any> {
    return new Observable(observer => this.timer.subscribe(() => {
      observer.next(new Date().getTime());
    })).share();
  }
}

export let TimeServiceProvider: Provider = {
  provide: TimeService, useClass: TimeService
};
