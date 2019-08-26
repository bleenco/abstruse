import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IntegrationService } from '../shared/integration.service';

@Component({
  selector: 'app-settings-integration-details',
  templateUrl: './settings-integration-details.component.html',
  styleUrls: ['./settings-integration-details.component.sass']
})
export class SettingsIntegrationDetailsComponent implements OnInit {
  integrationID: number;
  fetchingIntegration: boolean;
  i: any;
  processing: boolean;
  fetchingRepositories: boolean;
  repositories: any[];

  constructor(
    public integration: IntegrationService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.integrationID = this.route.snapshot.params.id;
    this.processing = false;
    this.i = null;
    this.fetchingRepositories = false;
    this.repositories = [];
    this.fetchIntegration();
  }

  update(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.processing = true;
    this.integration.updateIntegration(this.integrationID).subscribe(resp => {
      if (resp && resp.data) {
        this.fetchIntegration();
      }
    }, err => {
      console.error(err);
    }, () => {
      this.processing = false;
    });
  }

  fetchIntegration(): void {
    this.fetchingIntegration = true;
    this.integration.fetchIntegration(this.integrationID).subscribe(resp => {
      if (resp && resp.data) {
        this.i = resp.data;
        this.fetchRepos();
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingIntegration = false;
    });
  }

  fetchRepos(): void {
    this.fetchingRepositories = true;
    this.integration.fetchIntegrationRepos(this.integrationID).subscribe(resp => {
      if (resp && resp.data) {
        this.repositories = resp.data;
        this.fetchDBRepositories();
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingRepositories = false;
    });
  }

  fetchDBRepositories(): void {
    this.fetchingRepositories = true;
    this.integration.fetchRepositories().subscribe(resp => {
      if (resp && resp.data) {
        const dbrepos = resp.data;
        const provider = this.i.provider;
        this.repositories = this.repositories.map(repo => {
          repo.is_imported = false;
          if (dbrepos.find(dbrepo => dbrepo.provider_id === repo.id)) {
            repo.is_imported = true;
          }

          return repo;
        });
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetchingRepositories = false;
    });
  }
}
