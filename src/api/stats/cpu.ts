import { cpus } from 'os';
import { Observable } from 'rxjs';
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
    });
}

function cpuLoad(): Promise<ICpuData> {
  return new Promise(resolve => {
    let start = cpuAverage();

    setTimeout(() => {
      let end = cpuAverage();

      let cores = end.cores.map((core, i) => {
        let coreIdleDiff = core.idle - start.cores[i].idle;
        let coreTotalDiff = end.total - start.total;
        let corePercentage = 100 - parseInt(<any>(100 * coreIdleDiff / coreTotalDiff), 10);

        return {
          idle: 100 - corePercentage,
          total: corePercentage
        };
      });

      let idleDiff = end.idle - start.idle;
      let totalDiff = end.total - start.total;
      let percentage = 100 - parseInt(<any>(100 * idleDiff / totalDiff), 10);
      let data = { load: percentage, idle: 100 - percentage, cores: cores };

      resolve(data);
    }, 2000);
  });
}

function cpuAverage(): { idle: number, total: number, cores: { idle: number, total: number }[] } {
  let totalIdle = 0;
  let totalTick = 0;
  let cpuData = cpus();

  let data = cpuData.map(core => {
    let coreTotal = Object.keys(core.times).reduce((acc, curr) => acc + core.times[curr], 0);
    let coreIdle = core.times.idle;

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
