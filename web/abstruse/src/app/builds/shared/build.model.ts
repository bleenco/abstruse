import { Repo, generateRepoModel } from 'src/app/repos/shared/repo.model';
import { formatDistanceToNow, format, differenceInMilliseconds } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { TimeService } from '../../shared/providers/time.service';

export class Build {
  private time: TimeService;
  public runningTime: BehaviorSubject<string>;
  public createdAtWords: BehaviorSubject<string>;
  public buildStatus: BehaviorSubject<string>;
  public status: string;
  public processing: boolean = false;

  constructor(
    public id: number,
    public commit: string,
    public commitMessage: string,
    public branch: string,
    public pr: number,
    public prTitle: string,
    public config: string,
    public createdAt: Date,
    public updatedAt: Date,
    public startTime: Date,
    public endTime: Date,
    public repository: Repo | null,
    public authorAvatar: string,
    public authorName: string,
    public authorEmail: string,
    public committerAvatar: string,
    public committerName: string,
    public committerEmail: string,
    public jobs: Job[]
  ) {
    this.time = new TimeService();
    this.status = this.getBuildStatus;
    this.buildStatus = new BehaviorSubject<string>(this.status);
    this.runningTime = new BehaviorSubject<string>(this.getTimeRunning);
    this.createdAtWords = new BehaviorSubject<string>(formatDistanceToNow(this.createdAt) + ' ago');

    this.time.getCurrentTime().subscribe(() => {
      this.status = this.getBuildStatus;
      this.buildStatus.next(this.status);
      this.runningTime.next(this.getTimeRunning);
      this.createdAtWords.next(formatDistanceToNow(this.createdAt) + ' ago');
    });
  }

  resetTime(): void {
    this.startTime = new Date(0);
    this.endTime = new Date(0);
    this.runningTime.next(this.getTimeRunning);
  }

  get commitShort(): string {
    return this.commit.substring(0, 7);
  }

  get createdAtFormatted(): string {
    return format(this.createdAt, 'Do MMMM YYYY [at] HH:mm');
  }

  get getBuildStatus(): string {
    if (this.jobs.find(job => job.status === 'running')) {
      return 'running';
    }

    if (this.jobs.find(job => job.status === 'failing') && !this.jobs.find(job => job.status === 'queued')) {
      return 'failing';
    }

    if (this.jobs.every(job => job.status === 'passing')) {
      return 'passing';
    }

    return 'queued';
  }

  get getTimeRunning(): string {
    if (!this.jobs || !this.jobs.length || !this.jobs.find(job => job.startTime)) {
      return '00:00';
    }

    if (!this.startTime) {
      this.startTime = new Date(
        Math.min(...this.jobs.map(job => (job.startTime ? job.startTime.getTime() : new Date().getTime())))
      );
    }

    if (!this.endTime && this.jobs.every(job => job.endTime)) {
      this.endTime = new Date(Math.max(...this.jobs.map(job => job.endTime.getTime())));
    }

    const millis = differenceInMilliseconds(this.endTime ? this.endTime : new Date(), this.startTime);
    return format(new Date(millis), millis >= 3600000 ? 'hh:mm:ss' : 'mm:ss');
  }
}

export class Job {
  private time: TimeService;
  public runningTime: BehaviorSubject<string>;
  public processing: boolean = false;

  constructor(
    public id: number,
    public commands: string,
    public env: string,
    public image: string,
    public status: string,
    public log: string,
    public startTime: Date,
    public endTime: Date,
    public createdAt: Date,
    public updatedAt: Date,
    public buildId: number,
    public build: Build | null
  ) {
    this.time = new TimeService();
    this.runningTime = new BehaviorSubject<string>(this.getTimeRunning.time);

    this.time.getCurrentTime().subscribe(() => {
      this.runningTime.next(this.getTimeRunning.time);
    });
  }

  get getTimeRunning(): { millis: number; time: string } {
    if (!this.startTime) {
      return { millis: 0, time: '00:00' };
    }

    const millis = differenceInMilliseconds(this.endTime ? this.endTime : new Date(), this.startTime);
    return { millis, time: format(new Date(millis), millis >= 3600000 ? 'hh:mm:ss' : 'mm:ss') };
  }
}

export function generateBuildModel(data: any): Build {
  return new Build(
    Number(data.id),
    data.commit,
    data.commit_message,
    data.branch,
    Number(data.pr),
    data.pr_title,
    data.config,
    new Date(data.created_at || 0),
    new Date(data.updated_at || 0),
    new Date(data.start_time || 0),
    new Date(data.end_time || 0),
    data.repository ? generateRepoModel(data.repository) : null,
    data.author_avatar,
    data.author_name,
    data.author_email,
    data.committer_avatar,
    data.committer_name,
    data.committer_email,
    data.jobs && data.jobs.length ? data.jobs.map(generateJobModel) : []
  );
}

export function generateJobModel(data: any): Job {
  return new Job(
    Number(data.id),
    data.commands,
    data.env,
    data.image,
    data.status,
    data.log,
    new Date(data.start_time || 0),
    new Date(data.end_time || 0),
    new Date(data.created_at || 0),
    new Date(data.updated_at || 0),
    Number(data.build_id),
    data.build ? generateBuildModel(data.build) : null
  );
}
