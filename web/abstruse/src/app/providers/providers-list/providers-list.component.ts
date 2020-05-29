import { Component, OnInit } from '@angular/core';
import { ProvidersService } from '../shared/providers.service';
import { Provider } from '../shared/provider.class';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.sass']
})
export class ProvidersListComponent implements OnInit {
  providers: Provider[] = [];
  fetching: boolean;

  constructor(
    public providersService: ProvidersService,
    public modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.list();
  }

  openProviderModal(): void {
    const modalRef = this.modalService.open(ProvidersModalComponent, { size: 'small' });
    modalRef.componentInstance.provider = new Provider();
    modalRef.result
      .then(result => console.log(result), reason => console.log(reason));
  }

  list(): void {
    this.fetching = true;
    this.providersService.list().subscribe(resp => {
      this.providers = resp;
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }
}
