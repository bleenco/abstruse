import { Component, OnInit, OnDestroy } from '@angular/core';
import { BuildService } from '../shared/build.service';

@Component({
  selector: 'app-builds-latest',
  templateUrl: './builds-latest.component.html',
  styleUrls: ['./builds-latest.component.sass']
})
export class BuildsLatestComponent implements OnInit, OnDestroy {
  constructor(public buildService: BuildService) { }

  ngOnInit() {
    this.buildService.resetFields();
    this.buildService.fetchBuilds();
  }

  ngOnDestroy() {
    this.buildService.resetFields();
    this.buildService.unsubscribeFromBuilds();
  }
}
