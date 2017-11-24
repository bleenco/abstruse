import { Observable, Observer } from 'rxjs';
import * as utils from './utils';
import * as dockerode from 'dockerode';
import { processes } from './process-manager';

export const docker = new dockerode();

export function getContainersStats(): Observable<any> {
  return new Observable(observer => {
    Observable
      .interval(2000)
      .timeInterval()
      .mergeMap(() => {
        return docker.listContainers().then(containers => {
          return Promise.all(containers.map(container => {
            return docker.getContainer(container.Id).stats().then((stream: any) => {
              let json = '';
              return new Promise(resolve => {
                stream.on('data', buf => {
                  let rawJson = json + buf.toString();
                  try {
                    let data = JSON.parse(rawJson);

                    if (data && data.precpu_stats.system_cpu_usage) {
                      const jobId = container.Names[0].split('_')[2] || -1;
                      const job = processes.find(p => p.job_id === Number(jobId));
                      let debug = false;
                      if (job) {
                        debug = job.debug || false;
                      }

                      const stats = {
                        id: container.Id,
                        name: container.Names[0].substr(1) || '',
                        cpu: getCpuData(data),
                        network: getNetworkData(data),
                        memory: getMemory(data),
                        debug: debug
                      };

                      stream.destroy();
                      resolve(stats);
                    }
                  } catch (e) {
                    json = rawJson;
                  }
                });
              });
            });
          })).then(stats => stats);
        });
      })
      .map(stats => observer.next({ type: 'containersStats', data: stats }))
      .subscribe();
  }).share();
}

function getCpuData(json: any): { usage: string, cores: number } {
  const postCpuStats = json.cpu_stats;
  const preCpuStats = json.precpu_stats;
  const total = preCpuStats.cpu_usage.total_usage - postCpuStats.cpu_usage.total_usage;
  const curr = preCpuStats.system_cpu_usage - postCpuStats.system_cpu_usage;
  const perc = isNaN(total / (total + curr) * 100) ? 0 : total / (total + curr) * 100;

  return {
    usage: perc.toFixed(2) + '%',
    cores: postCpuStats.online_cpus
  };
}

function getNetworkData(json: any): { in: string, out: string } {
  if (json.networks && json.networks['eth0']) {
    const net = json.networks['eth0'];
    return {
      in: utils.getHumanSize(net.rx_bytes),
      out: utils.getHumanSize(net.tx_bytes)
    };
  } else {
    return { in: '0', out: '0' };
  }
}

function getMemory(json: any): { total: string, usage: string, percent: string } {
  const memStats = json.memory_stats;
  let memory = memStats.usage / memStats.limit * 100;
  memory = isNaN(memory) ? 0 : memory;
  return {
    total: utils.getHumanSize(memStats.limit),
    usage: utils.getHumanSize(memStats.usage),
    percent: memory.toFixed(2) + '%'
  };
}
