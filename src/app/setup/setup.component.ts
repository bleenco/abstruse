import { Component } from '@angular/core';
import { fadeAnimation } from '../core/shared/animations';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.sass'],
  animations: [fadeAnimation]
})
export class SetupComponent { }
