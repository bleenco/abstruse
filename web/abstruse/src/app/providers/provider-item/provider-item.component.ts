import { Component, OnInit, Input } from '@angular/core';
import { Provider } from '../shared/provider.class';

@Component({
  selector: 'app-provider-item',
  templateUrl: './provider-item.component.html',
  styleUrls: ['./provider-item.component.sass']
})
export class ProviderItemComponent implements OnInit {
  @Input() provider!: Provider;

  constructor() {}

  ngOnInit(): void {}
}
