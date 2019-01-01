export enum WorkerStatus {
  UNKNOWN,
  DOWN,
  OPERATIONAL
}

export class WorkerUsage {
  constructor(
    public capacity: number = 4,
    public capacity_load: number = 0,
    public cpu: number = 0,
    public memory: number = 0
  ) { }
}

export class Worker {
  usage: WorkerUsage;

  constructor(
    public id: number,
    public cert_id: string,
    public ip: string,
    public priority: number,
    public status: WorkerStatus,
    public created_at?: Date,
    public updated_at?: Date
  ) { }

  getStatus(): string {
    const status = String(this.status);
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  setUsage(usage: WorkerUsage) {
    this.usage = usage;
  }
}
