import { Injectable } from '@angular/core';
import { Provider } from './provider.class';
import { HttpClient } from '@angular/common/http';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  providers: Provider[] = [];
  fetchingProviders: boolean = false;

  constructor(private http: HttpClient, private modal: ModalService) {}

  openProviderModal(provider?: Provider): void {
    const modalRef = this.modal.open(ProvidersModalComponent, { size: 'medium' });
    if (provider) {
      modalRef.componentInstance.provider = new Provider(provider.id, provider.name, provider.url, provider.secret);
    } else {
      modalRef.componentInstance.provider = new Provider();
    }
    modalRef.result.then((ok: boolean) => {
      if (ok) {
        this.list();
      }
    });
  }

  list(): void {}
}
