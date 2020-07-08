import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { randomHash, durationValidator } from '../../shared';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.sass']
})
export class SecurityComponent implements OnInit {
  securityForm!: FormGroup;
  jwtExpiryTimes: { value: string; placeholder: string }[] = [
    { value: '15m', placeholder: '15 minutes' },
    { value: '30m', placeholder: '30 minutes' },
    { value: '45m', placeholder: '45 minutes' },
    { value: '1h', placeholder: '1 hour' },
    { value: '2h', placeholder: '2 hours' },
    { value: '3h', placeholder: '3 hours' }
  ];
  jwtRefreshExpiryTimes: { value: string; placeholder: string }[] = [
    { value: '15m', placeholder: '15 minutes' },
    { value: '30m', placeholder: '30 minutes' },
    { value: '45m', placeholder: '45 minutes' },
    { value: '1h', placeholder: '1 hour' },
    { value: '2h', placeholder: '2 hours' },
    { value: '3h', placeholder: '3 hours' }
  ];

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit(): void {}

  onSubmit(): void {}

  generateSecret(): void {
    const secret = randomHash(20);
    this.securityForm.controls.jwtSecret.setValue(secret);
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
