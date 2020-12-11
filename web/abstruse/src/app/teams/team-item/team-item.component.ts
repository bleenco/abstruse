import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { Team } from '../shared/user.model';
import { TeamModalComponent } from '../team-modal/team-modal.component';

@Component({
  selector: 'app-team-item',
  templateUrl: './team-item.component.html',
  styleUrls: ['./team-item.component.sass']
})
export class TeamItemComponent implements OnInit {
  @Input() team!: Team;
  @Output() saved = new EventEmitter<void>();

  constructor(public auth: AuthService, public modal: ModalService) {}

  ngOnInit(): void {}

  openTeamModal(): void {
    const modalRef = this.modal.open(TeamModalComponent, { size: 'small' });
    modalRef.componentInstance.team = { ...this.team };
    modalRef.result.then(
      ok => {
        if (ok) {
          this.saved.next();
        }
      },
      () => {}
    );
  }
}
