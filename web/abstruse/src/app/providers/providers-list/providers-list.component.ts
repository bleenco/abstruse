import { Component, OnInit } from '@angular/core';
import { ProvidersService } from '../shared/providers.service';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';
import { Provider } from '../shared/provider.class';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.sass']
})
export class ProvidersListComponent implements OnInit {
  constructor(public providers: ProvidersService, public modal: ModalService) {}

  ngOnInit(): void {}

  openProviderModal(provider?: Provider): void {
    const modalRef = this.modal.open(ProvidersModalComponent, { size: 'medium' });
    modalRef.componentInstance.provider = new Provider();
    modalRef.result.then((ok: boolean) => {
      if (ok) {
        this.providers.list();
      }
    });
  }
}
