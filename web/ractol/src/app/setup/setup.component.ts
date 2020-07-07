import { Component, OnInit } from '@angular/core';
import { ProgressWizardOptions } from '../shared';
import { SetupWizard } from './shared/wizard.model';
import { SetupService } from './shared/setup.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html'
})
export class SetupComponent implements OnInit {
  progressOptions: ProgressWizardOptions;
  wizard: SetupWizard;

  constructor(private setup: SetupService) {
    this.wizard = this.setup.wizard;
    this.progressOptions = { steps: this.setup.wizard.steps.map(s => s.route) };
  }

  ngOnInit(): void {}
}
