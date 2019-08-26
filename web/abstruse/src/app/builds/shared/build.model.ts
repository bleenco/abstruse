import { Repo, generateRepoModel } from 'src/app/repositories/shared/repo.model';
import { distanceInWordsToNow, format, differenceInMilliseconds } from 'date-fns';
import { Observable, Observer } from 'rxjs';
import { TimeService } from 'src/app/shared/providers/time.service';

export class Build {
  private time: TimeService;
  public running_time: Observable<string>;
  public created_at_words: Observable<string>;
  public processing: boolean;

  constructor(
    public id: number,
    public commit: string,
    public commit_message: string,
    public branch: string,
    public pr: number,
    public pr_title: string,
    public config: string,
    public start_time: Date,
    public end_time: Date,
    public created_at: Date,
    public updated_at: Date,
    public repository: Repo,
    public author_avatar: string,
    public author_name: string,
    public author_email: string,
    public committer_avatar: string,
    public committer_name: string,
    public committer_email: string,
    public status: string,
    public jobs: Job[]
  ) {
    this.time = new TimeService();

    this.running_time = new Observable<string>((observer: Observer<string>) => {
      observer.next(format(new Date(differenceInMilliseconds(this.end_time ? this.end_time : new Date(), this.start_time)), 'mm:ss'));
      const sub = this.time.getCurrentTime().subscribe((time: Date) => {
        observer.next(format(new Date(differenceInMilliseconds(this.end_time ? this.end_time : time, this.start_time)), 'mm:ss'));
      });

      return () => sub.unsubscribe();
    });

    this.created_at_words = new Observable<string>((observer: Observer<string>) => {
      observer.next(distanceInWordsToNow(this.created_at) + ' ago');
      const sub = this.time.getCurrentTime().subscribe((time: Date) => {
        observer.next(distanceInWordsToNow(this.created_at) + ' ago');
      });

      return () => sub.unsubscribe();
    });
  }

  getCommit(): string {
    return this.commit.substring(0, 7);
  }

  getCreatedAtFormatted(): string {
    return format(this.created_at, 'Do MMMM YYYY [at] HH:mm');
  }

  getStatus(): string {
    return this.status.substr(0, 1).toUpperCase() + this.status.substr(1).toLocaleLowerCase();
  }
}


export class Job {
  private time: TimeService;
  public running_time: Observable<string>;
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

    this.running_time = new Observable<string>((observer: Observer<string>) => {
      observer.next(this.getRunningTime());
      const sub = this.time.getCurrentTime().subscribe((time: Date) => {
        observer.next(this.getRunningTime());
      });

      return () => sub.unsubscribe();
    });
  }

  private getRunningTime(): string {
    if (!this.start_time) {
      return '00:00';
    }
    return format(new Date(differenceInMilliseconds(this.end_time ? this.end_time : new Date(), this.start_time)), 'mm:ss');
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
    new Date(data.start_time ? data.start_time : null),
    new Date(data.end_time ? data.end_time : null),
    new Date(data.created_at ? data.created_at : null),
    new Date(data.updated_at ? data.updated_at : null),
    data.repository ? generateRepoModel(data.repository) : null,
    data.author_avatar,
    data.author_name,
    data.author_email,
    data.committer_avatar,
    data.author_name,
    data.author_email,
    data.status ? data.status : 'passing',
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
    new Date(data.start_time ? data.start_time : null),
    new Date(data.end_time ? data.end_time : null),
    new Date(data.created_at ? data.created_at : null),
    new Date(data.updated_at ? data.updated_at : null),
    Number(data.build_id),
    data.build ? generateBuildModel(data.build) : null
  );
}
