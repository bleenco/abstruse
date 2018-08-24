import { Component, OnInit } from '@angular/core';
import { TeamService } from '../shared/team.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.sass']
})
export class TeamListComponent implements OnInit {

  constructor(public teamService: TeamService) { }

  ngOnInit() {
    this.teamService.tab = 'team';
    this.teamService.fetchTeam();
  }
}
