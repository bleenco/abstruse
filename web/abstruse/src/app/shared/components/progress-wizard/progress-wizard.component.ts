import { Component, OnInit, Input, OnChanges } from '@angular/core';

export interface ProgressWizardOptions {
  steps: string[];
}

@Component({
  selector: 'app-progress-wizard',
  templateUrl: './progress-wizard.component.html',
  styleUrls: ['./progress-wizard.component.sass']
})
export class ProgressWizardComponent implements OnInit, OnChanges {
  @Input() options: ProgressWizardOptions = { steps: [] };
  @Input() step!: number;

  progressPercent!: number;

  constructor() {}

  ngOnInit() {
    this.progressPercent = this.calcPercent();
  }

  ngOnChanges() {
    this.progressPercent = this.calcPercent();
  }

  private calcPercent(): number {
    if (!this.step || !this.options.steps || !this.options.steps.length) {
      return 0;
    }

    return (100 * (this.step - 1 || 0)) / (this.options.steps.length - 1);
  }
}
