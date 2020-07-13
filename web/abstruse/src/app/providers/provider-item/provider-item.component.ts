import { Component, OnInit, Input } from '@angular/core';
import { Provider } from '../shared/provider.class';
import { ProvidersService } from '../shared/providers.service';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-provider-item',
  templateUrl: './provider-item.component.html',
  styleUrls: ['./provider-item.component.sass']
})
export class ProviderItemComponent implements OnInit {
  @Input() provider!: Provider;

  synchronizing: boolean = false;
  error: string | null = null;

  constructor(private providersService: ProvidersService) {}

  ngOnInit(): void {}

  sync(): void {
    this.synchronizing = true;
    this.providersService
      .sync(this.provider.id!)
      .pipe(
        finalize(() => (this.synchronizing = false)),
        untilDestroyed(this)
      )
      .subscribe(
        () => {
          this.provider.updatedAt = new Date();
        },
        err => {
          this.error = err.message;
        }
      );
  }
}
