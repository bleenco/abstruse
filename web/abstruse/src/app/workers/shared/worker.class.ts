export enum WorkerStatus {
  UNKNOWN,
  DOWN,
  OPERATIONAL
}

export class Worker {
  constructor(
    public id: string,
    public ip: string,
    public priority: number,
    public status: WorkerStatus
  ) { }
}
