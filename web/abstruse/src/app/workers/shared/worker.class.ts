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
    public status: 'down' | 'operational',
    public created_at?: Date,
    public updated_at?: Date
  ) {
    this.resetUsage();
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

  setUsage(usage: WorkerUsage): void {
    this.usage = usage;
  }

  getCapacityUsage(): string {
    if (this.usage && this.usage.capacity && this.usage.capacity_load) {
      return this.usage.capacity_load + ' / ' + this.usage.capacity;
    } else {
      return '/';
    }
  }

  getCpuUsage(): string {
    return this.usage && this.usage.cpu ? String(this.usage.cpu) + '%' : '/';
  }

  getMemoryUsage(): string {
    return this.usage && this.usage.memory ? String(this.usage.memory) + '%' : '/';
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
