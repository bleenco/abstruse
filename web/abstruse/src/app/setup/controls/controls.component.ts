import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { SetupWizard } from '../shared/wizard.model';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.sass']
})
export class ControlsComponent implements OnInit {
  wizard: SetupWizard;

  constructor(private setup: SetupService) {
    this.wizard = this.setup.wizard;
  }

  ngOnInit(): void {}

  next(): void {
    this.setup.next();
  }

  back(): void {
    this.setup.back();
  }
}
