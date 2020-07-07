import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Setup } from './setup.model';
import { SetupWizard, defaultWizardConfig } from './wizard.model';

@Injectable({ providedIn: 'root' })
export class SetupService {
  wizard: SetupWizard = defaultWizardConfig();

  constructor(private http: HttpClient, private router: Router) {}

  next(): void {
    if (this.wizard.step < this.wizard.steps.length) {
      this.wizard.step++;
      this.navigate();
    }
  }

  back(): void {
    if (this.wizard.step >= 1) {
      this.wizard.step--;
      this.navigate();
    }
  }

  navigate(): void {
    const step = this.wizard.steps.find(s => s.step === this.wizard.step);
    this.router.navigate([`/setup/${step?.route}`]);
  }

  ready(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get<Setup>('/setup/ready').subscribe(
        resp => {
          if (resp.database && resp.user) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        () => {
          resolve(false);
        }
      );
    });
  }
}
