import { Component, Input, OnInit } from '@angular/core';
import { Team } from '../shared/user.model';

@Component({
  selector: 'app-team-list-item',
  templateUrl: './team-list-item.component.html',
  styleUrls: ['./team-list-item.component.sass']
})
export class TeamListItemComponent implements OnInit {
  @Input() team!: Team;

  constructor() {}

  ngOnInit(): void {}
}
