import { Component, OnInit, Input } from '@angular/core';
import { Provider } from '../shared/provider.class';

@Component({
  selector: 'app-providers-list-item',
  templateUrl: './providers-list-item.component.html',
  styleUrls: ['./providers-list-item.component.sass']
})
export class ProvidersListItemComponent implements OnInit {
  @Input() provider!: Provider;

  constructor() {}

  ngOnInit(): void {}
}
