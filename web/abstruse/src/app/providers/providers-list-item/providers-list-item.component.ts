import { Component, OnInit, Input } from '@angular/core';
import { Provider } from '../shared/provider.class';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';

@Component({
  selector: 'app-providers-list-item',
  templateUrl: './providers-list-item.component.html',
  styleUrls: ['./providers-list-item.component.sass']
})
export class ProvidersListItemComponent implements OnInit {
  @Input() provider: Provider;

  constructor(
    public modalService: ModalService
  ) { }

  ngOnInit(): void { }

  openProviderModal(): void {
    const modalRef = this.modalService.open(ProvidersModalComponent, { size: 'medium' });
    modalRef.componentInstance.provider = new Provider(this.provider.id, this.provider.name, this.provider.url);
    modalRef.result
      .then(result => console.log(result), reason => console.log(reason));
  }
}
