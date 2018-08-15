import { Component, OnInit } from '@angular/core';
import { BuildService } from '../shared/build.service';

@Component({
  selector: 'app-builds-latest',
  templateUrl: './builds-latest.component.html',
  styleUrls: ['./builds-latest.component.sass']
})
export class BuildsLatestComponent implements OnInit {

  constructor(public buildService: BuildService) { }

  ngOnInit() {
    this.buildService.resetFields();
    this.buildService.fetchBuilds();
  }

}
