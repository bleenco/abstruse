import { Component, OnInit } from '@angular/core';
import { Integration } from '../shared/integration.class';
import { ActiveModal } from 'src/app/shared/components/modal/modal-ref.class';

@Component({
  selector: 'app-integrations-modal',
  templateUrl: './integrations-modal.component.html',
  styleUrls: ['./integrations-modal.component.sass']
})
export class IntegrationsModalComponent implements OnInit {
  integration: Integration;
  providers = [
    { value: 'github', placeholder: 'GitHub' },
    { value: 'gitlab', placeholder: 'GitLab' },
    { value: 'bitbucket', placeholder: 'Bitbucket' },
    { value: 'gitea', placeholder: 'Gitea' }
  ];

  constructor(
    public activeModal: ActiveModal
  ) { }

  ngOnInit(): void {
  }

}
