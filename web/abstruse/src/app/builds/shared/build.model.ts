import { Repo, generateRepoModel } from 'src/app/repositories/shared/repo.model';
import { distanceInWordsToNow, format, differenceInMilliseconds } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { TimeService } from 'src/app/shared/providers/time.service';

export class Build {
  private time: TimeService;
  public running_time: BehaviorSubject<string>;
  public created_at_words: BehaviorSubject<string>;
  public build_status: BehaviorSubject<string>;
  public status: string;
  public processing: boolean;

  constructor(
    public id: number,
    public commit: string,
    public commit_message: string,
    public branch: string,
    public pr: number,
    public pr_title: string,
    public config: string,
    public created_at: Date,
    public updated_at: Date,
    public repository: Repo,
    public author_avatar: string,
    public author_name: string,
    public author_email: string,
    public committer_avatar: string,
    public committer_name: string,
    public committer_email: string,
    public jobs: Job[]
  ) {
    this.time = new TimeService();
    this.status = this.getBuildStatus();
    this.build_status = new BehaviorSubject<string>(this.status);
    this.running_time = new BehaviorSubject<string>(this.getTimeRunning());
    this.created_at_words = new BehaviorSubject<string>(distanceInWordsToNow(this.created_at) + ' ago');

    this.time.getCurrentTime().subscribe((time: Date) => {
      this.status = this.getBuildStatus();
      this.build_status.next(this.status);
      this.running_time.next(this.getTimeRunning());
      this.created_at_words.next(distanceInWordsToNow(this.created_at) + ' ago');
    });
  }

  getCommit(): string {
    return this.commit.substring(0, 7);
  }

  getCreatedAtFormatted(): string {
    return format(this.created_at, 'Do MMMM YYYY [at] HH:mm');
  }

  private getBuildStatus(): string {
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

  getTimeRunning(): string {
    if (!this.jobs || !this.jobs.length) {
      return '00:00';
    }

    const millis = Math.max(...this.jobs.map(job => job.getTimeRunning().millis));
    return format(new Date(millis), millis >= 3600000 ? 'hh:mm:ss' : 'mm:ss');
  }
}


export class Job {
  private time: TimeService;
  public running_time: BehaviorSubject<string>;
  public processing: boolean;

  constructor(
    public id: number,
    public commands: string,
    public env: string,
    public image: string,
    public status: string,
    public log: string,
    public start_time: Date,
    public end_time: Date,
    public created_at: Date,
    public updated_at: Date,
    public build_id: number,
    public build: Build
  ) {
    this.time = new TimeService();
    this.running_time = new BehaviorSubject<string>(this.getTimeRunning().time);

    this.time.getCurrentTime().subscribe((time: Date) => {
      this.running_time.next(this.getTimeRunning().time);
    });
  }

  getTimeRunning(): { millis: number, time: string } {
    if (!this.start_time) {
      return { millis: 0, time: '00:00' };
    }

    const millis = differenceInMilliseconds(this.end_time ? this.end_time : new Date(), this.start_time);
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
    data.pr_message,
    data.config,
    data.created_at ? new Date(data.created_at) : null,
    data.updated_at ? new Date(data.updated_at) : null,
    data.repository ? generateRepoModel(data.repository) : null,
    data.author_avatar,
    data.author_name,
    data.author_email,
    data.committer_avatar,
    data.author_name,
    data.author_email,
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
    data.start_time ? new Date(data.start_time) : null,
    data.end_time ? new Date(data.end_time) : null,
    data.created_at ? new Date(data.created_at) : null,
    data.updated_at ? new Date(data.updated_at) : null,
    Number(data.build_id),
    data.build ? generateBuildModel(data.build) : null
  );
}
