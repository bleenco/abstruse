import { Component, OnInit, Input } from '@angular/core';
import { Provider } from '../shared/provider.class';
import { ProvidersService } from '../shared/providers.service';

@Component({
  selector: 'app-providers-list-item',
  templateUrl: './providers-list-item.component.html',
  styleUrls: ['./providers-list-item.component.sass']
})
export class ProvidersListItemComponent implements OnInit {
  @Input() provider: Provider;

  constructor(public providersService: ProvidersService) { }

  ngOnInit(): void { }
}
