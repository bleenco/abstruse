import { Component, OnInit } from '@angular/core';
import { SetupService } from '../shared/setup.service';
import { SetupConfig } from '../shared/setup.model';

@Component({
  selector: 'app-setup-config',
  templateUrl: './setup-config.component.html',
  styleUrls: ['./setup-config.component.sass']
})
export class SetupConfigComponent implements OnInit {

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.setup.config = new SetupConfig();
  }

  generateRandomSecret(): void {
    this.setup.config.secret = this.setup.generateRandomString(10);
  }

  generateRandomJWTKey(): void {
    this.setup.config.jwtSecret = this.setup.generateRandomString(10);
  }

}
