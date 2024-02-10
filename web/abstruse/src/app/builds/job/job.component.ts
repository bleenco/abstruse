import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SocketEvent } from 'src/app/shared/models/socket.model';
import { Job } from '../shared/build.model';
import { ActivatedRoute } from '@angular/router';
import { BuildsService } from '../shared/builds.service';
import { DataService } from 'src/app/shared/providers/data.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { TerminalTheme } from 'src/app/shared/components/terminal/terminal.component';

const THEME_KEY = 'abstruse-console-theme';

@UntilDestroy()
@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.sass']
})
export class JobComponent implements OnInit, OnDestroy {
  jobID!: number;
  buildID!: number;
  job!: Job;
  fetching = false;
  processing = false;
  sub: Subscription = new Subscription();
  error: string | null = null;
  theme: TerminalTheme;

  get logURL(): string {
    return [`/api/v1/builds/job/${this.jobID}/log`, this.authService.token || ''].join('?token=');
  }

  constructor(
    private route: ActivatedRoute,
    private buildsService: BuildsService,
    private dataService: DataService,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {
    if (!localStorage.getItem(THEME_KEY)) {
      localStorage.setItem(THEME_KEY, 'light');
    }
    this.theme = localStorage.getItem(THEME_KEY) as TerminalTheme;
  }

  ngOnInit(): void {
    this.jobID = Number(this.route.snapshot.paramMap.get('jobid'));
    this.buildID = Number(this.route.snapshot.paramMap.get('buildid'));
    this.findJob();
    this.sub.add(
      this.buildsService.jobEvents().subscribe((ev: SocketEvent) => this.updateJobFromEvent(ev))
    );
    this.sub.add(
      this.buildsService
        .jobLogEvents()
        .subscribe((ev: SocketEvent) => this.updateJobLogFromEvent(ev))
    );
    this.buildsService.subscribeToJobEvents();
    this.buildsService.subscribeToJobLogEvents(this.jobID);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.dataService.unsubscribeAll();
  }

  changeTheme(): void {
    const curr = localStorage.getItem(THEME_KEY) as TerminalTheme;
    this.theme = curr === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, this.theme);
  }

  findJob(): void {
    this.fetching = true;
    this.buildsService
      .findJob(this.jobID)
      .pipe(
        finalize(() => (this.fetching = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.job = resp;
        },
        err => (this.error = err.message)
      );
  }

  restartJob(): void {
    this.job.log = '__CLEAR__';
    this.job.processing = true;
    this.buildsService
      .restartJob(this.job.id)
      .pipe(
        finalize(() => { this.findJob(); this.changeDetector.detectChanges(); this.job.processing = false; }),
        untilDestroyed(this)
      )
      .subscribe(
        () => {},
        err => (this.error = err.message)
      );
  }

  stopJob(): void {
    this.job.processing = true;
    this.buildsService
      .stopJob(this.job.id)
      .pipe(
        finalize(() => (this.job.processing = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {},
        err => (this.error = err.message)
      );
  }

  private updateJobFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data || ev.data.jobID !== this.jobID) {
      return;
    }

    this.job.startTime = ev.data.startTime ? new Date(ev.data.startTime) : null;
    this.job.endTime = ev.data.endTime ? new Date(ev.data.endTime) : null;
    this.job.status = ev.data.status;
  }

  private updateJobLogFromEvent(ev: SocketEvent): void {
    if (!this.job || !ev.data || ev.data.id !== this.jobID) {
      return;
    }

    this.job.log = ev.data.log;
  }
}
