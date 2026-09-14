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
  public processing = false;

  constructor(
    public id: number,
    public commit: string,
    public commitMessage: string,
    public branch: string,
    public pr: number,
    public prTitle: string,
    public config: string,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public startTime: Date | null,
    public endTime: Date | null,
    public repository: Repo | null,
    public authorAvatar: string,
    public authorName: string,
    public authorEmail: string,
    public authorLogin: string,
    public committerAvatar: string,
    public committerName: string,
    public committerEmail: string,
    public committerLogin: string,
    public jobs: Job[]
  ) {
    this.time = new TimeService();
    this.status = this.getBuildStatus;
    this.buildStatus = new BehaviorSubject<string>(this.status);
    this.runningTime = new BehaviorSubject<string>(this.getTimeRunning);
    this.createdAtWords = new BehaviorSubject<string>(
      formatDistanceToNow(this.createdAt as Date) + ' ago'
    );

    this.time.getCurrentTime().subscribe(() => {
      this.status = this.getBuildStatus;
      this.buildStatus.next(this.status);
      this.runningTime.next(this.getTimeRunning);
      this.createdAtWords.next(formatDistanceToNow(this.createdAt as Date) + ' ago');
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
    return format(this.createdAt as Date, 'Do MMMM YYYY [at] HH:mm');
  }

  get getBuildStatus(): string {
    if (this.jobs.find(job => job.status === 'running')) {
      return 'running';
    }

    if (
      this.jobs.find(job => job.status === 'failing') &&
      !this.jobs.find(job => job.status === 'queued')
    ) {
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
        Math.min(
          ...this.jobs.map(job => (job.startTime ? job.startTime.getTime() : new Date().getTime()))
        )
      );
    }

    if (!this.endTime && this.jobs.every(job => job.endTime)) {
      this.endTime = new Date(Math.max(...this.jobs.map(job => (job.endTime as Date).getTime())));
    }

    const millis = differenceInMilliseconds(
      this.endTime ? this.endTime : new Date(),
      this.startTime
    );
    return format(new Date(millis), millis >= 3600000 ? 'hh:mm:ss' : 'mm:ss');
  }
}

export class Job {
  private time: TimeService;
  public runningTime: BehaviorSubject<string>;
  public processing = false;

  constructor(
    public id: number,
    public commands: string,
    public env: string,
    public image: string,
    public status: string,
    public log: string,
    public startTime: Date | null,
    public endTime: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public buildId: number,
    public build: Build | null,
    public assignedWorker: string,
  ) {
    this.time = new TimeService();
    this.runningTime = new BehaviorSubject<string>(this.getTimeRunning.time);

    this.time.getCurrentTime().subscribe(() => {
      this.runningTime.next(this.getTimeRunning.time);
    });
  }

  get command(): string {
    return (
      (this.env !== '' &&
        this.env
          .split(' ')
          .filter(e => !e.startsWith('ABSTRUSE_'))
          .join(' ')) ||
      ''
    );
  }

  get getTimeRunning(): { millis: number; time: string } {
    if (!this.startTime) {
      return { millis: 0, time: '00:00' };
    }

    const millis = Number(
      differenceInMilliseconds(this.endTime ? this.endTime : new Date(), this.startTime)
    );
    return { millis, time: format(new Date(millis), millis >= 3600000 ? 'hh:mm:ss' : 'mm:ss') };
  }
}

export function generateBuildModel(data: any): Build {
  return new Build(
    Number(data.id),
    data.commit,
    data.commitMessage,
    data.branch,
    Number(data.pr),
    data.prTitle,
    data.config,
    data.createdAt ? new Date(data.createdAt) : null,
    data.updatedAt ? new Date(data.updatedAt) : null,
    data.start_time ? new Date(data.startTime) : null,
    data.endTime ? new Date(data.endTime) : null,
    data.repository ? generateRepoModel(data.repository) : null,
    data.authorAvatar,
    data.authorName,
    data.authorEmail,
    data.authorLogin,
    data.committerAvatar,
    data.committerName,
    data.committerEmail,
    data.committerLogin,
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
    data.startTime ? new Date(data.startTime) : null,
    data.endTime ? new Date(data.endTime) : null,
    data.createdAt ? new Date(data.createdAt) : null,
    data.updatedAt ? new Date(data.updatedAt) : null,
    Number(data.buildID),
    data.build ? generateBuildModel(data.build) : null,
    data.assignedWorker
  );
}
