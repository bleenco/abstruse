import { Component, OnInit } from '@angular/core';
import { ProvidersService } from '../shared/providers.service';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ProvidersModalComponent } from '../providers-modal/providers-modal.component';
import { Provider } from '../shared/provider.class';
import { finalize } from 'rxjs/operators';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.sass']
})
export class ProvidersComponent implements OnInit {
  providers: Provider[] = [];
  loading = false;
  error: string | null = null;

  constructor(public providersService: ProvidersService, public modal: ModalService) {}

  ngOnInit(): void {
    this.find();
  }

  openProviderModal(): void {
    const modalRef = this.modal.open(ProvidersModalComponent, { size: 'medium' });
    modalRef.componentInstance.provider = new Provider();
    modalRef.result.then(
      (ok: boolean) => {
        if (ok) {
          this.find();
        }
      },
      () => {}
    );
  }

  find(): void {
    this.loading = true;
    this.providersService
      .find()
      .pipe(
        finalize(() => (this.loading = false)),
        untilDestroyed(this)
      )
      .subscribe(
        resp => {
          this.providers = resp;
        },
        err => {
          this.error = err.message;
        }
      );
  }

  onSaved(): void {
    this.find();
  }
}
