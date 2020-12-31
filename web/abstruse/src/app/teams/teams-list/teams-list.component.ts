import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, finalize, map } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { TeamsService } from '../shared/teams.service';
import { Team } from '../shared/user.model';
import { TeamModalComponent } from '../team-modal/team-modal.component';
import { AuthService } from 'src/app/auth/shared/auth.service';
import Fuse from 'fuse.js';

@UntilDestroy()
@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.sass']
})
export class TeamsListComponent implements OnInit, AfterViewInit {
  @ViewChild('keyword') keyword!: ElementRef;

  teams: Team[] = [];
  displayedTeams: Team[] = [];
  fetchingTeams = false;
  error: string | null = null;

  constructor(
    private teamsService: TeamsService,
    public modal: ModalService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.list();
  }

  ngAfterViewInit(): void {
    fromEvent(this.keyword.nativeElement, 'keyup')
      .pipe(
        map(() => this.keyword.nativeElement.value),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe(keyword => {
        if (keyword === '') {
          this.displayedTeams = [...this.teams];
          return;
        }

        const fuse = new Fuse([...this.teams], { keys: ['name', 'about'], threshold: 0.3 });
        this.displayedTeams = fuse.search(keyword).map(r => r.item);
      });
  }

  openTeamModal(): void {
    const modalRef = this.modal.open(TeamModalComponent, { size: 'medium' });
    modalRef.result.then(
      ok => {
        if (ok) {
          this.list();
        }
      },
      () => {}
    );
  }

  onSaved(): void {
    this.list();
  }

  list(): void {
    this.fetchingTeams = true;
    this.teamsService
      .list()
      .pipe(
        finalize(() => (this.fetchingTeams = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.teams = resp;
          this.displayedTeams = [...this.teams];
        },
        err => {
          this.error = err.message;
        }
      );
  }
}
