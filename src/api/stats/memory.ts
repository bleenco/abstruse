import { freemem, totalmem } from 'os';
import { Observable, timer } from 'rxjs';
import { map, mergeMap, share, timeInterval } from 'rxjs/operators';

import { IOutput } from '../socket';

export interface IMemoryData {
  total: number;
  free: number;
}

export function memory(): Observable<IOutput> {
  return timer(0, 2000)
    .pipe(
      timeInterval(),
      mergeMap(() => getMemory()),
      map((res: IMemoryData) => {
        return { type: 'memory', data: res };
      }),
      share()
    );
}

async function getMemory(): Promise<IMemoryData> {
  return {
    total: totalmem(),
    free: freemem()
  };
}
