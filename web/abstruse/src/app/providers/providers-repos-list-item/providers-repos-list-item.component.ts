import { Component, OnInit, Input } from '@angular/core';
import { ProviderRepo } from '../shared/provider-repo.class';

@Component({
  selector: 'app-providers-repos-list-item',
  templateUrl: './providers-repos-list-item.component.html',
  styleUrls: ['./providers-repos-list-item.component.sass']
})
export class ProvidersReposListItemComponent implements OnInit {
  @Input() repo!: ProviderRepo;

  constructor() {}

  ngOnInit(): void {}

  import(): void {}
}
