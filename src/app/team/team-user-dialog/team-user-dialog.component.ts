import { Component, OnInit } from '@angular/core';
import { TeamService } from '../shared/team.service';

@Component({
  selector: 'app-team-user-dialog',
  templateUrl: './team-user-dialog.component.html',
  styleUrls: ['./team-user-dialog.component.sass']
})
export class TeamUserDialogComponent implements OnInit {

  constructor(public teamService: TeamService) { }

  ngOnInit() { }
}
