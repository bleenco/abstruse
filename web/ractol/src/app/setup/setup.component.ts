import { Component, OnInit } from '@angular/core';
import { ProgressWizardOptions } from '../shared';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html'
})
export class SetupComponent implements OnInit {
  progressWizardOptions: ProgressWizardOptions = { steps: ['database', 'auth', 'user', 'config'] };
  progressWizardStep: number = 2;

  constructor() {}

  ngOnInit(): void {}
}
