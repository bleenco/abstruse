import { distanceInWordsToNow } from 'date-fns';

export enum BuildStatus {
  'queued' = 'queued',
  'running' = 'running',
  'passed' = 'passed',
  'failed' = 'failed'
}

export class Build {
  constructor(
    public id: number,
    public pr: number,
    public repository_name: string,
    public branch: string,
    public commit_sha: string,
    public tag: string,
    public author_name: string,
    public author_avatar: string,
    public committer_avatar: string,
    public commit_message: string,
    public dateTime: string,
    public build_time: number,
    public status: BuildStatus
  ) { }

  getStatusTitle(): string {
    return this.status.replace(/^\w/, c => c.toUpperCase());
  }

  getSHA(): string {
    return this.commit_sha.substr(0, 7);
  }

  getDateTime(): string {
    return distanceInWordsToNow(this.dateTime);
  }
}
