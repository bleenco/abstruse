import { Component, OnInit, Input } from '@angular/core';
import { ProviderRepo } from '../shared/repo.class';
import { ProvidersService } from '../shared/providers.service';

@Component({
  selector: 'app-providers-repos-list-item',
  templateUrl: './providers-repos-list-item.component.html',
  styleUrls: ['./providers-repos-list-item.component.sass']
})
export class ProvidersReposListItemComponent implements OnInit {
  @Input() repo: ProviderRepo;
  @Input() providerId: number;

  saving: boolean;
  imported: boolean;

  constructor(private providersService: ProvidersService) {}

  ngOnInit(): void {}

  import(): void {
    this.saving = true;
    this.providersService.import(this.providerId, this.repo).subscribe(
      resp => {
        if (resp && resp.data) {
          this.repo.isImported = true;
        }
      },
      err => {
        console.error(err);
      },
      () => {
        this.saving = false;
      }
    );
  }
}
