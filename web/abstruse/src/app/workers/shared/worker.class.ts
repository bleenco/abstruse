import { BehaviorSubject, timer } from 'rxjs';

export class WorkerUsage {
  constructor(
    public capacity: number = 4,
    public capacity_load: number = 0,
    public cpu: number = 0,
    public memory: number = 0
  ) { }
}

export class Worker {
  usage: WorkerUsage = new WorkerUsage();
  capacity_percent: BehaviorSubject<number>;

  constructor(
    public id: number,
    public cert_id: string,
    public ip: string,
    public status: 'down' | 'operational',
    public created_at?: Date,
    public updated_at?: Date
  ) {
    this.resetUsage();
    this.capacity_percent = new BehaviorSubject<number>(this.getCapacityPercent());

    timer(0, 1000).subscribe(() => this.capacity_percent.next(this.getCapacityPercent()));
  }

  getStatus(): string {
    const status = String(this.status);
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  setStatus(status: 'down' | 'operational'): void {
    this.status = status;
    if (status === 'down') {
      this.resetUsage();
    }
  }

  setUsage(cpu: number, memory: number): void {
    this.usage.cpu = cpu;
    this.usage.memory = memory;
  }

  setCapacity(total: number, used: number): void {
    this.usage.capacity = total;
    this.usage.capacity_load = used;
  }

  getCapacityUsage(): string {
    if (this.usage && typeof this.usage.capacity !== null && typeof this.usage.capacity_load !== null) {
      return this.usage.capacity_load + ' / ' + this.usage.capacity;
    } else {
      return '/';
    }
  }

  getCpuUsage(): string {
    return this.usage && this.usage.cpu ? String(this.usage.cpu) + '%' : '0%';
  }

  getMemoryUsage(): string {
    return this.usage && this.usage.memory ? String(this.usage.memory) + '%' : '0%';
  }

  private getCapacityPercent(): number {
    if (this.usage && typeof this.usage.capacity !== null && typeof this.usage.capacity_load !== null) {
      return Number(this.usage.capacity_load) / Number(this.usage.capacity) * 100;
    } else {
      return 0;
    }
  }

  private resetUsage(): void {
    this.usage = {
      capacity: 0,
      capacity_load: 0,
      cpu: 0,
      memory: 0
    };
  }
}
