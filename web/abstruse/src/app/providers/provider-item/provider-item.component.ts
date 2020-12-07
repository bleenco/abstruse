import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Provider, generateProvider } from '../shared/provider.class';
import { ProvidersService } from '../shared/providers.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-provider-item',
  templateUrl: './provider-item.component.html',
  styleUrls: ['./provider-item.component.sass']
})
export class ProviderItemComponent implements OnInit {
  @Input() provider!: Provider;
  @Output() saved: EventEmitter<void> = new EventEmitter<void>();

  synchronizing = false;
  error: string | null = null;

  constructor(private providersService: ProvidersService, public modal: ModalService) {}

  ngOnInit(): void {}

  openProviderModal(): void {
    const modalRef = this.modal.open(ProvidersModalComponent, { size: 'medium' });
    modalRef.componentInstance.provider = generateProvider(this.provider);
    modalRef.result.then(
      (ok: boolean) => {
        if (ok) {
          this.saved.emit();
        }
      },
      () => {}
    );
  }

  sync(): void {
    this.synchronizing = true;
    this.providersService
      .sync(this.provider.id as number)
      .pipe(
        finalize(() => (this.synchronizing = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.provider.lastSync = new Date();
        },
        err => {
          this.error = err.message;
        }
      );
  }
}
