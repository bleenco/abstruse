export enum WorkerStatus {
  UNKNOWN,
  DOWN,
  OPERATIONAL
}

export class Worker {
  constructor(
    public id: string,
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
}
