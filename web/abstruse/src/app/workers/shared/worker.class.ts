import { formatDistanceToNow, subSeconds } from 'date-fns';

export class Worker {
  currentCPU: number;
  currentMem: number;
  cpu: { date?: Date; value: number }[][] = [[]];
  memory: { date?: Date; value: number }[][] = [[]];
  jobsMax: number;
  jobsRunning: number;
  jobsPercent: number;

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
    public connectedAt: Date,
    public usage: {
      cpu: number;
      mem: number;
      jobs_max: number;
      jobs_running: number;
      timestamp: Date;
    }[]
  ) {
    this.initUsage();
  }

  get getUptime(): string {
    return formatDistanceToNow(this.connectedAt);
  }

  updateUsage(data: { cpu: number; mem: number; jobs_max: number; jobs_running: number }): void {
    this.cpu[0].push({ value: data.cpu, date: new Date() });
    this.memory[0].push({ value: data.mem, date: new Date() });
    if (this.memory[0].length > 130) {
      this.memory[0].shift();
    }
    if (this.cpu[0].length > 130) {
      this.cpu[0].shift();
    }
    this.currentCPU = data.cpu;
    this.currentMem = data.mem;
    this.jobsMax = data.jobs_max;
    this.jobsRunning = data.jobs_running;
    this.jobsPercent = Math.round((this.jobsRunning / this.jobsMax) * 100);
  }

  private initUsage(): void {
    try {
      this.cpu = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.cpu }))];
      this.memory = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.mem }))];
      this.currentCPU = this.usage[this.usage.length - 1].cpu;
      this.currentMem = this.usage[this.usage.length - 1].mem;
      this.jobsMax = this.usage[this.usage.length - 1].jobs_max;
      this.jobsRunning = this.usage[this.usage.length - 1].jobs_running;
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
    data.host.boot_time,
    data.host.procs,
    data.host.os,
    data.host.platform,
    data.host.platform_family,
    data.host.platform_version,
    data.host.kernel_version,
    data.host.kernel_arch,
    data.host.virtualization_system,
    data.host.virtualization_role,
    data.host.host_id,
    data.host.connected_at ? new Date(data.host.connected_at) : null,
    data.usage
  );
}
