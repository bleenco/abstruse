import { Component, OnInit } from '@angular/core';
import { TeamService } from '../shared/team.service';

@Component({
  selector: 'app-team-user-item',
  templateUrl: './team-user-item.component.html',
  styleUrls: ['./team-user-item.component.sass']
})
export class TeamUserItemComponent implements OnInit {

  constructor(public teamService: TeamService) { }

  ngOnInit() {
  }

}
