import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SetupService } from '../shared/setup.service';

@Component({
  selector: 'app-setup-config',
  templateUrl: './setup-config.component.html',
  styleUrls: ['./setup-config.component.sass']
})
export class SetupConfigComponent implements OnInit {
  @ViewChild('configForm') configForm: NgForm;

  saving: boolean;
  saveMessageOK: boolean;
  saveMessageError: boolean;

  constructor(public setup: SetupService) { }

  ngOnInit() {
    this.setup.fetchConfig();
  }

  generateRandomSecret(): void {
    this.setup.config.secret = this.setup.generateRandomString(10);
    this.configForm.control.markAsDirty();
  }

  generateRandomJWTKey(): void {
    this.setup.config.jwtSecret = this.setup.generateRandomString(10);
    this.configForm.control.markAsDirty();
  }

  resetForm(): void {
    this.setup.fetchConfig();
    this.configForm.control.markAsPristine();
  }

  save(): void {
    this.saving = true;
    this.saveMessageError = false;
    this.saveMessageOK = false;

    this.setup.saveConfig().subscribe(resp => {
      if (resp && resp.data === 'ok') {
        this.saveMessageOK = true;
      } else {
        this.saveMessageError = true;
      }

      this.saving = false;
      this.configForm.control.markAsPristine();
    });
  }

}
