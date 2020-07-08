import { Component, OnInit } from '@angular/core';
import { randomHash } from '../../shared';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.sass']
})
export class SecurityComponent implements OnInit {
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

  constructor() {}

  ngOnInit(): void {}

  generateSecret(): void {
    const secret = randomHash(12);
    console.log(secret);
  }
}
