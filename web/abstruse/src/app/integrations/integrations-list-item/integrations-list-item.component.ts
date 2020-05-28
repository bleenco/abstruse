import { Component, OnInit, Input } from '@angular/core';
import { Integration } from '../shared/integration.class';

@Component({
  selector: 'app-integrations-list-item',
  templateUrl: './integrations-list-item.component.html',
  styleUrls: ['./integrations-list-item.component.sass']
})
export class IntegrationsListItemComponent implements OnInit {
  @Input() integration: Integration;

  constructor() { }

  ngOnInit(): void { }

}
