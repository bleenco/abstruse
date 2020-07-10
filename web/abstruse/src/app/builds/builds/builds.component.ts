import { Component, OnInit } from '@angular/core';
import { Build, generateBuildModel } from '../shared/build.model';
import { builds } from '../../../testing/fixtures/builds';

@Component({
  selector: 'app-builds',
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.sass']
})
export class BuildsComponent implements OnInit {
  builds: Build[] = [];

  constructor() {}

  ngOnInit(): void {
    this.builds = builds.map(generateBuildModel);
  }
}
