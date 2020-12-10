import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { Team } from '../shared/team.model';
import { TeamsService } from '../shared/teams.service';
import { TeamModalComponent } from '../team-modal/team-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.sass']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  fetchingTeams = false;

  constructor(private teamsService: TeamsService, public modal: ModalService) {}

  ngOnInit(): void {
    this.list();
  }

  openTeamModal(): void {
    const modalRef = this.modal.open(TeamModalComponent, { size: 'small' });
    modalRef.result.then(
      ok => {
        if (ok) {
          this.list();
        }
      },
      () => {}
    );
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
        },
        err => {
          console.error(err);
        }
      );
  }
}
