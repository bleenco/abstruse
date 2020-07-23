import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../shared/profile.service';
import { Session } from '../shared/session.model';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.sass']
})
export class SessionsComponent implements OnInit {
  sessions: Session[] = [];
  loading: boolean = false;

  constructor(private profile: ProfileService) {}

  ngOnInit(): void {
    this.findSessions();
  }

  findSessions(): void {
    this.loading = true;
    this.profile
      .findSessions()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => (this.sessions = resp),
        () => {
          this.sessions = [];
        }
      );
  }
}
