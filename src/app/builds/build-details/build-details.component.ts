import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';

@Component({
  selector: 'app-build-details',
  templateUrl: './build-details.component.html',
  styleUrls: ['./build-details.component.sass']
})
export class BuildDetailsComponent implements OnInit, OnDestroy {
  buildId: number;

  constructor(
    public buildService: BuildService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.buildService.build = null;
    this.buildId = this.route.snapshot.params.id;
    this.buildService.fetchBuild(this.buildId);
  }

  ngOnDestroy() {
    this.buildService.build = null;
  }
}
