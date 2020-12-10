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
    const data = {
      name: this.form.controls.name.value,
      about: this.form.controls.about.value,
      color: this.form.controls.color.value
    };

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

  private createForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      about: [null, [Validators.required]],
      color: [null, [Validators.required]]
    });
  }
}
