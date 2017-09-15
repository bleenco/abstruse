import { totalmem, freemem } from 'os';
import { Observable } from 'rxjs';
import { IOutput } from '../socket';

export interface IMemoryData {
  total: number;
  free: number;
}

export function memory(): Observable<IOutput> {
  return Observable.timer(0, 2000)
    .timeInterval()
    .mergeMap(() => getMemory())
    .map((res: IMemoryData) => {
      return { type: 'memory', data: res };
    })
    .share();
}

function getMemory(): Promise<IMemoryData> {
  return new Promise(resolve => {
    resolve({
      total: totalmem(),
      free: freemem()
    });
  });
}
