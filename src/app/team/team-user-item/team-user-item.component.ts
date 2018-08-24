import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from '../shared/team.service';
import { User } from '../shared/team.model';

@Component({
  selector: 'app-team-user-item',
  templateUrl: './team-user-item.component.html',
  styleUrls: ['./team-user-item.component.sass']
})
export class TeamUserItemComponent implements OnInit {
  @Input() user: User;

  constructor(public teamService: TeamService) { }

  ngOnInit() { }
}
