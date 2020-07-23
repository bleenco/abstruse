import { Component, OnInit, Input } from '@angular/core';
import { Session } from '../shared/session.model';

@Component({
  selector: 'app-session-list-item',
  templateUrl: './session-list-item.component.html',
  styleUrls: ['./session-list-item.component.sass']
})
export class SessionListItemComponent implements OnInit {
  @Input() session!: Session;

  constructor() {}

  ngOnInit(): void {}
}
