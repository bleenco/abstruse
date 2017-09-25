import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({ name: 'toTime'})
export class ToTimePipe implements PipeTransform  {
  transform(value) {
    if (value < 0) {
      return '00:00';
    } else {
      let time = new Date(value);
      let hours = time.getUTCHours();
      if (hours > 0) {
        return `${hours}:${format(value, 'mm:ss')}`;
      } else {
        return format(value, 'mm:ss');
      }
    }
  }
}
