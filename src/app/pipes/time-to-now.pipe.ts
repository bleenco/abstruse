import { Pipe, ChangeDetectorRef } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { format, distanceInWordsToNow } from 'date-fns';

@Pipe({
  name: 'timeToNow',
  pure: false
})
export class TimeToNowPipe extends AsyncPipe {
  value: number;
  timer: Observable<string>;

  constructor(private ref: ChangeDetectorRef) {
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

  private getTimer(): Observable<string> {
    return Observable
      .interval(1000)
      .startWith(0)
      .map(() => distanceInWordsToNow(this.value));
  }
}
