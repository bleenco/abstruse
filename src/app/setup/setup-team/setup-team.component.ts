import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setup-team',
  templateUrl: './setup-team.component.html',
  styleUrls: ['./setup-team.component.sass']
})
export class SetupTeamComponent implements OnInit {
  memberType: { value: boolean, placeholder: string }[] = [
    { value: false, placeholder: 'User' },
    { value: true, placeholder: 'Administrator' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
