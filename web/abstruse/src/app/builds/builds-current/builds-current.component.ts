import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BuildService } from '../shared/build.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';
import { Build, generateBuildModel } from '../shared/build.model';

@Component({
  selector: 'app-builds-current',
  templateUrl: './builds-current.component.html',
  styleUrls: ['./builds-current.component.sass']
})
export class BuildsCurrentComponent implements OnInit {
  repoid: number;
  fetching: boolean;
  build: Build;

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.repoid = this.route.snapshot.params.repoid;

    this.fetchCurrentBuild();
  }

  fetchCurrentBuild(): void {
    this.fetching = true;
    this.buildService.fetchCurrentBuildByRepoID(this.repoid).subscribe((resp: JSONResponse) => {
      if (resp && resp.data) {
        this.build = generateBuildModel(resp.data);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }
}
