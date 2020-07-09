import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { randomHash, durationValidator } from '../../shared';
import { SetupService } from '../shared/setup.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.sass']
})
export class SecurityComponent implements OnInit {
  securityForm!: FormGroup;
  submitted: boolean = false;
  saved: boolean = false;
  jwtExpiryTimes: { value: string; placeholder: string }[] = [
    { value: '15m', placeholder: '15 minutes' },
    { value: '30m', placeholder: '30 minutes' },
    { value: '45m', placeholder: '45 minutes' },
    { value: '1h', placeholder: '1 hour' },
    { value: '2h', placeholder: '2 hours' },
    { value: '3h', placeholder: '3 hours' }
  ];
  jwtRefreshExpiryTimes: { value: string; placeholder: string }[] = [
    { value: '30m', placeholder: '30 minutes' },
    { value: '45m', placeholder: '45 minutes' },
    { value: '1h', placeholder: '1 hour' },
    { value: '2h', placeholder: '2 hours' },
    { value: '3h', placeholder: '3 hours' },
    { value: '6h', placeholder: '6 hours' }
  ];

  constructor(private fb: FormBuilder, public setup: SetupService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.setup
      .fetchConfig()
      .pipe(untilDestroyed(this))
      .subscribe(config => {
        this.setup.config = { ...config };
        this.resetValues();
        this.saved = true;
        setTimeout(() => (this.saved = false), 5000);
      });

    this.securityForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => (this.saved = false));
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.securityForm.valid) {
      return;
    }

    const config = {
      ...this.setup.config,
      ...{
        auth: {
          jwtSecret: this.securityForm.controls.jwtSecret.value,
          jwtExpiry: this.securityForm.controls.jwtExpiry.value,
          jwtRefreshExpiry: this.securityForm.controls.jwtRefreshExpiry.value
        }
      }
    };

    this.setup
      .saveConfig(config)
      .pipe(untilDestroyed(this))
      .subscribe(
        () => {
          this.setup.config = { ...config };
          this.saved = true;
          this.securityForm.markAsPristine();
          this.setup.wizard.steps[this.setup.wizard.step - 1].nextEnabled = true;
        },
        err => {
          this.resetValues();
          console.error(err);
        }
      );
  }

  resetValues(): void {
    this.securityForm.patchValue({
      jwtSecret: this.setup.config.auth.jwtSecret,
      jwtExpiry: this.setup.config.auth.jwtExpiry,
      jwtRefreshExpiry: this.setup.config.auth.jwtRefreshExpiry
    });
    this.securityForm.markAsPristine();
    this.saved = false;
  }

  generateSecret(): void {
    const secret = randomHash(20);
    this.securityForm.patchValue({ jwtSecret: secret });
    this.securityForm.controls.jwtSecret.markAsDirty();
  }

  private createForm(): void {
    this.securityForm = this.fb.group({
      jwtSecret: ['', [Validators.required, Validators.minLength(8)]],
      jwtExpiry: ['', Validators.required],
      jwtRefreshExpiry: ['', Validators.required]
    });

    this.securityForm.controls.jwtRefreshExpiry.setValidators([
      Validators.required,
      durationValidator(this.securityForm.controls.jwtExpiry)
    ]);
  }
}
