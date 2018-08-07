import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setup-team',
  templateUrl: './setup-team.component.html',
  styleUrls: ['./setup-team.component.sass']
})
export class SetupTeamComponent implements OnInit {
  memberType: { value: number, placeholder: string }[] = [
    { value: 0, placeholder: 'User' },
    { value: 1, placeholder: 'Administrator' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
