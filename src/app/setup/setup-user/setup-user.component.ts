import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';

@Component({
  selector: 'app-setup-user',
  templateUrl: './setup-user.component.html',
  styleUrls: ['./setup-user.component.sass']
})
export class SetupUserComponent implements OnInit {

  constructor(public setup: SetupService) { }

  ngOnInit() {
  }

}
