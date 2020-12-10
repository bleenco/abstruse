import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';
import { Team } from '../shared/team.model';
import { TeamsService } from '../shared/teams.service';

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

  onSubmit(): void {}

  private createForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      about: [null, [Validators.required]],
      color: [null, [Validators.required]]
    });
  }
}
