export class SetupStatus {
  requirements?: {
    git?: { status?: boolean, version?: string },
    sqlite?: { status?: boolean, version?: string },
    docker: { status?: boolean, version?: string }
    dockerRunning: { status?: boolean }
  };

  constructor() { }
}
