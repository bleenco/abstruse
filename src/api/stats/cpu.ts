import { cpus } from 'os';
import { Observable } from 'rxjs/Observable';
import { IOutput } from '../socket';

export interface ICpuData {
  idle: number;
  load: number;
  cores: Object[];
}

export function cpu(): Observable<IOutput> {
  return Observable.timer(0, 2000)
    .timeInterval()
    .mergeMap(() => cpuLoad())
    .map((res: ICpuData) => {
      return { type: 'cpu', data: res };
    })
    .share();
}

function cpuLoad(): Promise<ICpuData> {
  return new Promise(resolve => {
    const start = cpuAverage();

    setTimeout(() => {
      const end = cpuAverage();

      const cores = end.cores.map((core, i) => {
        const coreIdleDiff = core.idle - start.cores[i].idle;
        const coreTotalDiff = end.total - start.total;
        const corePercentage = 100 - parseInt(<any>(100 * coreIdleDiff / coreTotalDiff), 10);

        return {
          idle: 100 - corePercentage,
          total: corePercentage
        };
      });

      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      const percentage = 100 - parseInt(<any>(100 * idleDiff / totalDiff), 10);
      const data = { load: percentage, idle: 100 - percentage, cores: cores };

      resolve(data);
    }, 2000);
  });
}

function cpuAverage(): { idle: number, total: number, cores: { idle: number, total: number }[] } {
  const totalIdle = 0;
  const totalTick = 0;
  const cpuData = cpus();

  const data = cpuData.map(core => {
    const coreTotal = Object.keys(core.times).reduce((acc, curr) => acc + core.times[curr], 0);
    const coreIdle = core.times.idle;

    return { idle: coreIdle, total: coreTotal };
  }).reduce((acc, curr) => {
    acc.idle += curr.idle;
    acc.load += curr.total;
    acc.cores.push(curr);

    return acc;
  }, { idle: 0, load: 0, cores: [] });

  return {
    idle: data.idle / data.cores.length,
    total: data.load / data.cores.length,
    cores: data.cores
  };
}
