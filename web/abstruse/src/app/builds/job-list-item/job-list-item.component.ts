import { Component, OnInit, Input } from '@angular/core';
import { Job, Build } from '../shared/build.model';
import { BuildsService } from '../shared/builds.service';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from 'src/app/auth/shared/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-job-list-item',
  templateUrl: './job-list-item.component.html',
  styleUrls: ['./job-list-item.component.sass']
})
export class JobListItemComponent implements OnInit {
  @Input() job!: Job;
  @Input() build!: Build;

  processing = false;

  constructor(public buildsService: BuildsService, public auth: AuthService) {}

  ngOnInit(): void {}

  restartJob(): void {
    this.processing = true;
    this.buildsService
      .restartJob(this.job.id)
      .pipe(
        finalize(() => (this.processing = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {},
        err => {
          console.error(err);
        }
      );
  }

  stopJob(): void {
    this.processing = true;
    this.buildsService
      .stopJob(this.job.id)
      .pipe(
        finalize(() => (this.processing = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {},
        err => {
          console.error(err);
        }
      );
  }
}
