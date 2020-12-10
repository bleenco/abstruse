import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { Team } from '../shared/user.model';
import { TeamsService } from '../shared/teams.service';

@UntilDestroy()
@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.sass']
})
export class TeamComponent implements OnInit {
  id!: number;
  team!: Team;
  fetchingTeam = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private teamsService: TeamsService) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.find();
  }

  find(): void {
    this.fetchingTeam = true;
    this.teamsService
      .find(this.id)
      .pipe(
        finalize(() => (this.fetchingTeam = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.team = resp;
        },
        err => {
          this.error = err.message;
        }
      );
  }
}
