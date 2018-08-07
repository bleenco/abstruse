import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';

@Component({
  selector: 'app-setup-check',
  templateUrl: './setup-check.component.html',
  styleUrls: ['./setup-check.component.sass']
})
export class SetupCheckComponent implements OnInit {

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.setup.checkRequirements();
  }

}
