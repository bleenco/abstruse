import { Observable, Observer } from 'rxjs';
import * as utils from './utils';
import { listContainers, calculateContainerStats } from './docker';
import { processes } from './process-manager';

export function getContainersStats(): Observable<any> {
  return new Observable(observer => {
    let sub = Observable
      .interval(2000)
      .timeInterval()
      .mergeMap(() => {
        return listContainers()
          .then(containers => Promise.all(containers.map(c => getContainerStats(c))));
      })
      .map(stats => observer.next({ type: 'containersStats', data: stats }))
      .subscribe();

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }).share();
}

function getContainerStats(container: any): Promise<any> {
  return calculateContainerStats(container, processes).then(stats => {
    return {
      id: stats.id,
      name: stats.name,
      cpu: getCpuData(stats.data),
      network: getNetworkData(stats.data),
      memory: getMemory(stats.data),
      debug: stats.debug
    };
  });
}

function getCpuData(json: any): { usage: string, cores: number } {
  let postCpuStats = json.cpu_stats;
  let preCpuStats = json.precpu_stats;
  let total = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage;
  let curr = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage;
  let perc = isNaN(total / (total + curr) * 100) ? 0 : total / (total + curr) * 100;

  return {
    usage: perc.toFixed(2) + '%',
    cores: postCpuStats.online_cpus
  };
}

function getNetworkData(json: any): { in: string, out: string } {
  if (json.networks && json.networks['eth0']) {
    let net = json.networks['eth0'];
    return {
      in: utils.getHumanSize(net.rx_bytes),
      out: utils.getHumanSize(net.tx_bytes)
    };
  } else {
    return { in: '0', out: '0' };
  }
}

function getMemory(json: any): { total: string, usage: string, percent: string } {
  let memStats = json.memory_stats;
  let memory = memStats.usage / memStats.limit * 100;
  memory = isNaN(memory) ? 0 : memory;
  return {
    total: utils.getHumanSize(memStats.limit),
    usage: utils.getHumanSize(memStats.usage),
    percent: memory.toFixed(2) + '%'
  };
}
