import { Component, OnInit } from '@angular/core';
import { ProvidersService } from '../shared/providers.service';
import { Provider } from '../shared/provider.class';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.sass']
})
export class ProvidersListComponent implements OnInit {

  constructor(public providersService: ProvidersService) { }

  ngOnInit(): void {
    this.providersService.list();
  }
}
