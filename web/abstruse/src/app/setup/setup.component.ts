import { Component, OnInit } from '@angular/core';
import { ProgressWizardOptions } from '../shared';
import { SetupWizard } from './shared/wizard.model';
import { SetupService } from './shared/setup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html'
})
export class SetupComponent implements OnInit {
  progressOptions: ProgressWizardOptions;
  wizard: SetupWizard;

  constructor(private setup: SetupService, private router: Router) {
    this.wizard = this.setup.wizard;
    this.progressOptions = { steps: this.setup.wizard.steps.map(s => s.route) };
  }

  ngOnInit(): void {
    const splitted = this.router.url.split('/');
    const step = this.wizard.steps.find(s => s.route === splitted[splitted.length - 1]);
    this.setup.wizard.step = step!.step;
  }
}
