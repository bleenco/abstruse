import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-settings-integration-item',
  templateUrl: './settings-integration-item.component.html',
  styleUrls: ['./settings-integration-item.component.sass']
})
export class SettingsIntegrationItemComponent implements OnInit {
  @Input() data: any;

  constructor() { }

  ngOnInit() {
  }

}
