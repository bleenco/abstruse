import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Build, generateBuildModel } from '../shared/build.model';
import { BuildService } from '../shared/build.service';
import { JSONResponse } from 'src/app/core/shared/shared.model';

@Component({
  selector: 'app-builds-history',
  templateUrl: './builds-history.component.html',
  styleUrls: ['./builds-history.component.sass']
})
export class BuildsHistoryComponent implements OnInit {
  repoid: number;
  fetching: boolean;
  builds: Build[];
  limit = 5;
  offset = 0;
  tab: 'all' | 'commits' | 'pr';

  constructor(
    public route: ActivatedRoute,
    public buildService: BuildService
  ) { }

  ngOnInit() {
    this.repoid = this.route.snapshot.params.repoid;
    this.tab = 'all';

    this.fetchBuilds();
  }

  fetchBuilds(): void {
    this.fetching = true;
    this.buildService.fetchBuildsByRepoID(this.repoid).subscribe((resp: JSONResponse) => {
      if (resp && resp.data && resp.data.length) {
        this.builds = resp.data.map(generateBuildModel);
      }
    }, err => {
      console.error(err);
    }, () => {
      this.fetching = false;
    });
  }

}
