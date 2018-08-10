import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';

@Component({
  selector: 'app-setup-config',
  templateUrl: './setup-config.component.html',
  styleUrls: ['./setup-config.component.sass']
})
export class SetupConfigComponent implements OnInit {

  constructor(public setup: SetupService) { }

  ngOnInit() {
  }

}
