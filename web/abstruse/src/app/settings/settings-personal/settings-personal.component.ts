import { Component, OnInit } from '@angular/core';
import { IntegrationService } from '../shared/integration.service';

@Component({
  selector: 'app-settings-personal',
  templateUrl: './settings-personal.component.html',
  styleUrls: ['./settings-personal.component.sass']
})
export class SettingsPersonalComponent implements OnInit {
  fetchingIntegrations: boolean;
  integrations: any[];

  constructor(public integration: IntegrationService) { }

  ngOnInit() {
    this.fetchingIntegrations = true;
    this.integrations = [];
    this.fetchIntegrations();
  }

  fetchIntegrations(): void {
    this.fetchingIntegrations = true;
    this.integration.fetchIntegrations().subscribe(resp => {
      if (resp && resp.data && resp.data.length) {
        this.integrations = resp.data;
        console.log(this.integrations);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingIntegrations = false;
    });
  }

  integrationsUpdated(): void {
    this.fetchIntegrations();
  }
}
