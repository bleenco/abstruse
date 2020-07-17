import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { share } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TimeService {
  timer: Observable<number>;

  constructor() {
    this.timer = timer(0, 1000);
  }

  getCurrentTime(): Observable<Date> {
    return new Observable<Date>(observer => {
      const sub = this.timer.subscribe(() => {
        observer.next(new Date());
      });

      return () => sub.unsubscribe();
    }).pipe(share());
  }
}
