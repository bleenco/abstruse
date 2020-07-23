import { Component, OnInit } from '@angular/core';
import { SystemService } from '../shared/system.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.sass']
})
export class VersionComponent implements OnInit {
  constructor(public system: SystemService) {}

  ngOnInit(): void {
    this.system.fetchVersion();
  }
}
