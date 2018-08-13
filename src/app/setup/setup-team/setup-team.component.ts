import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';

@Component({
  selector: 'app-setup-team',
  templateUrl: './setup-team.component.html',
  styleUrls: ['./setup-team.component.sass']
})
export class SetupTeamComponent implements OnInit {

  constructor(public setup: SetupService) { }

  ngOnInit() {
  }

}
