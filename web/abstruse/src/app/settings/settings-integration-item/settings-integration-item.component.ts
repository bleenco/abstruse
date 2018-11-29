import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IntegrationService } from '../shared/integration.service';

@Component({
  selector: 'app-settings-integration-item',
  templateUrl: './settings-integration-item.component.html',
  styleUrls: ['./settings-integration-item.component.sass']
})
export class SettingsIntegrationItemComponent implements OnInit {
  @Input() data: any;
  @Output() updated: EventEmitter<void>;

  processing: boolean;

  constructor(public integration: IntegrationService) {
    this.updated = new EventEmitter<void>();
  }

  ngOnInit() { }

  update(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.processing = true;
    this.integration.updateIntegration(this.data.id).subscribe(resp => {
      if (resp && resp.data) {
        this.updated.emit();
      }
    }, err => {
      console.error(err);
    }, () => {
      this.processing = false;
    });
  }

}
