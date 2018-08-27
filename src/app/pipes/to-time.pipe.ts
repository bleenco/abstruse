import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

const getUTCDate = (dateString = Date.now()) => {
  const date = new Date(dateString);

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
};

@Pipe({ name: 'toTime'})
export class ToTimePipe implements PipeTransform  {
  transform(value) {
    if (value < 0) {
      return '00:00';
    } else {
      let time = new Date(value);
      let hours = time.getUTCHours();
      let minutesAndSeconds = format(getUTCDate(value), 'mm:ss');

      if (hours > 0) {
        return `${hours}:${minutesAndSeconds}`;
      } else {
        return minutesAndSeconds;
      }
    }
  }
}
