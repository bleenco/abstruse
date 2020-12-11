import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Team } from '../shared/user.model';
import { TeamsService } from '../shared/teams.service';

@UntilDestroy()
@Component({
  selector: 'app-team-modal',
  templateUrl: './team-modal.component.html',
  styleUrls: ['./team-modal.component.sass']
})
export class TeamModalComponent implements OnInit {
  team!: Team;
  saving = false;
  error: string | null = null;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private teamsService: TeamsService, public activeModal: ActiveModal) {}

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }

    this.error = null;
    this.saving = true;
    let data: any = {
      name: this.form.controls.name.value,
      about: this.form.controls.about.value,
      color: this.form.controls.color.value
    };
    if (this.team && this.team.id) {
      data = { ...data, ...{ id: this.team.id } };
    }

    if (data.id) {
      this.teamsService
        .update(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          () => {
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    } else {
      this.teamsService
        .create(data)
        .pipe(
          finalize(() => (this.saving = false)),
          untilDestroyed(this)
        )
        .subscribe(
          () => {
            this.activeModal.close(true);
          },
          err => {
            this.error = err.message;
          }
        );
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [(this.team && this.team.id) || null, []],
      name: [(this.team && this.team.name) || null, [Validators.required]],
      about: [(this.team && this.team.about) || null, [Validators.required]],
      color: [(this.team && this.team.color) || null, [Validators.required]]
    });
  }
}
