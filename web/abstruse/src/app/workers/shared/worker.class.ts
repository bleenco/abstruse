import { formatDistanceToNow, fromUnixTime, subSeconds } from 'date-fns';

export class Worker {
  currentCPU: number;
  currentMem: number;
  cpu: { date?: Date, value: number }[][] = [[]];
  memory: { date?: Date, value: number }[][] = [[]];
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
    public usage: {
      cpu: number,
      mem: number,
      jobs_max: number,
      jobs_running: number,
      timestamp: Date
    }[]
  ) {
    this.initUsage();
  }

  getUptime(): string {
    return formatDistanceToNow(fromUnixTime(this.bootTime));
  }

  private initUsage(): void {
    try {
      this.cpu = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.cpu }))];
      this.memory = [this.usage.map((u, i) => ({ date: subSeconds(new Date(), this.usage.length - i), value: u.mem }))];
      this.currentCPU = this.usage[this.usage.length - 1].cpu;
      this.currentMem = this.usage[this.usage.length - 1].mem;
      this.jobsMax = this.usage[this.usage.length - 1].jobs_max;
      this.jobsRunning = this.usage[this.usage.length - 1].jobs_running;
      this.jobsPercent = Math.round(this.jobsRunning / this.jobsMax * 100);
    } catch {
      this.currentCPU = 0;
      this.currentMem = 0;
      this.jobsMax = 0;
      this.jobsRunning = 0;
      this.jobsPercent = 0;
    }
  }

  updateUsage(data: { cpu: number, mem: number, jobs_max: number, jobs_running: number }): void {
    this.cpu[0].push({ value: data.cpu, date: new Date() });
    this.cpu[0].shift();
    this.memory[0].push({ value: data.mem, date: new Date() });
    this.memory[0].shift();
    this.currentCPU = data.cpu;
    this.currentMem = data.mem;
    this.jobsMax = data.jobs_max;
    this.jobsRunning = data.jobs_running;
    this.jobsPercent = Math.round(this.jobsRunning / this.jobsMax * 100);
  }
}
