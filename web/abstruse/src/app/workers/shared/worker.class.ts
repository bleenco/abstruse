export class Worker {
  usage: WorkerUsage = new WorkerUsage();

  constructor(
    public certID: string,
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
    public hostID: string
  ) { }
}

export class WorkerUsage {
  constructor(
    public capacity: number = 0,
    public capacityLoad: number = 0,
    public cpu: number = 0,
    public memory: number = 0
  ) { }
}
