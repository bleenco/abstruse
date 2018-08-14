import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';

@Component({
  selector: 'app-setup-team',
  templateUrl: './setup-team.component.html',
  styleUrls: ['./setup-team.component.sass']
})
export class SetupTeamComponent implements OnInit {
  finishing: boolean;

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.finishing = false;
    this.setup.fetchUsers();
  }

  finishSetup(): void {
    this.finishing = true;
    this.setup.setSetupDone().subscribe(resp => {
      if (resp && resp.data && resp.data === 'ok') {
        this.setup.goToLogin();
      }
    });
  }

}
