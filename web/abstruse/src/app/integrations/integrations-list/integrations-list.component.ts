import { Component, OnInit } from '@angular/core';
import { IntegrationsService } from '../shared/integrations.service';
import { Integration } from '../shared/integration.class';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { filter } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { IntegrationsModalComponent } from '../integrations-modal/integrations-modal.component';

@Component({
  selector: 'app-integrations-list',
  templateUrl: './integrations-list.component.html',
  styleUrls: ['./integrations-list.component.sass']
})
export class IntegrationsListComponent implements OnInit {
  integrations: Integration[] = [];
  fetching: boolean;

  constructor(
    public integrationsService: IntegrationsService,
    public modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.find();
  }

  openIntegrationModal(index?: number): void {
    const modalRef = this.modalService.open(IntegrationsModalComponent);
    if (index) {
      modalRef.componentInstance.integration = this.integrations[index];
    }
    modalRef.result
      .then(result => console.log(result), reason => console.log(reason));
  }

  find(): void {
    this.fetching = true;
    this.integrationsService.find()
      .pipe(filter(resp => resp.data && resp.data.length))
      .subscribe((resp: JSONResponse) => {
        this.integrations = resp.data.map((i: any) => {
          return new Integration(i.id, i.proider, i.url, i.api_url);
        });
      }, err => {
        console.error(err);
      }, () => {
        this.fetching = false;
      });
  }
}
