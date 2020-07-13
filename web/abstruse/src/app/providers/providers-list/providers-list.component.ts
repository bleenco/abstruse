import { Component, OnInit } from '@angular/core';
import { ProvidersService } from '../shared/providers.service';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.sass']
})
export class ProvidersListComponent implements OnInit {
  constructor(public providers: ProvidersService) {}

  ngOnInit(): void {}
}
