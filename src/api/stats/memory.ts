import { totalmem, freemem } from 'os';
import { Observable, timer } from 'rxjs';
import { timeInterval, mergeMap, map, share } from 'rxjs/operators';
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

function getMemory(): Promise<IMemoryData> {
  return new Promise(resolve => {
    resolve({
      total: totalmem(),
      free: freemem()
    });
  });
}
