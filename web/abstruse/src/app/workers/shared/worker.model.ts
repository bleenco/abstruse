import { formatDistanceToNow, subSeconds } from 'date-fns';
import { RealtimeCanvasChartData } from 'ngx-graph';

export interface WorkerUsage {
  cpu: number;
  mem: number;
  jobsMax: number;
  jobsRunning: number;
  timestamp: Date;
}

export class Worker {
  currentCPU = 0;
  currentMem = 0;
  cpu: RealtimeCanvasChartData[][] = [[]];
  memory: RealtimeCanvasChartData[][] = [[]];
  jobsMax = 0;
  jobsRunning = 0;
  jobsPercent = 0;

  constructor(
    public id: string,
    public addr: string,
    public hostname: string,
    public uptime: number,
    public bootTime: number,
    public procs: number,
    public os: string,
    public platform: string,
    public platformFamily: string,
    public platformVersion: string,
    public kernelVersion: string,
    public kernelArch: string,
    public virtualizationSystem: string,
    public virtualizationRole: string,
    public hostID: string,
    public connectedAt: Date | null,
    public usage: WorkerUsage[]
  ) {
    this.initUsage();
  }

  get getUptime(): string {
    return formatDistanceToNow(this.connectedAt as Date);
  }

  get jobsUsage(): string {
    const curr = this.jobsRunning || 0;
    const max = this.jobsMax || 0;
    return `${curr} / ${max}`;
  }

  updateUsage(data: { cpu: number; mem: number; jobsMax: number; jobsRunning: number }): void {
    this.cpu[0].push({ value: data.cpu, date: new Date() });
    this.memory[0].push({ value: data.mem, date: new Date() });
    if (this.memory[0].length > 130) {
      this.memory[0].shift();
    }
    if (this.cpu[0].length > 130) {
      this.cpu[0].shift();
    }
    this.currentCPU = data.cpu || 0;
    this.currentMem = data.mem || 0;
    this.jobsMax = data.jobsMax || 0;
    this.jobsRunning = data.jobsRunning || 0;
    this.jobsPercent = Math.round((this.jobsRunning / this.jobsMax) * 100) || 0;
  }

  private initUsage(): void {
    try {
      this.cpu = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.cpu }))];
      this.memory = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.mem }))];
      this.currentCPU = this.usage[this.usage.length - 1].cpu;
      this.currentMem = this.usage[this.usage.length - 1].mem;
      this.jobsMax = this.usage[this.usage.length - 1].jobsMax;
      this.jobsRunning = this.usage[this.usage.length - 1].jobsRunning;
      this.jobsPercent = Math.round((this.jobsRunning / this.jobsMax) * 100);
    } catch {
      this.currentCPU = 0;
      this.currentMem = 0;
      this.jobsMax = 0;
      this.jobsRunning = 0;
      this.jobsPercent = 0;
    }
  }
}

export function generateWorker(data: any): Worker {
  return new Worker(
    data.id,
    data.addr,
    data.host.hostname,
    data.host.uptime,
    data.host.bootTime,
    data.host.procs,
    data.host.os,
    data.host.platform,
    data.host.platformFamily,
    data.host.platformVersion,
    data.host.kernelVersion,
    data.host.kernelArch,
    data.host.virtualizationSystem,
    data.host.virtualizationRole,
    data.host.hostID,
    data.host.connectedAt ? new Date(data.host.connectedAt) : null,
    data.usage
  );
}
