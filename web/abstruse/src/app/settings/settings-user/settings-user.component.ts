import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-user',
  templateUrl: './settings-user.component.html',
  styleUrls: ['./settings-user.component.sass']
})
export class SettingsUserComponent implements OnInit {

  value = true;
  fetching: boolean;

  constructor() { }

  ngOnInit(): void { }
}
