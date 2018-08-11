export class SetupStatus {
  requirements?: {
    git?: { status?: boolean, version?: string },
    sqlite?: { status?: boolean, version?: string },
    docker: { status?: boolean, version?: string }
    dockerRunning: { status?: boolean }
  };

  constructor() { }
}

export class SetupConfig {
  constructor(
    public secret: string = '',
    public jwtSecret: string = '',
    public concurrency: number = 4,
    public idleTimeout: number = 600,
    public jobTimeout: number = 3600,
    public requireLogin: boolean = true
  ) { }
}
