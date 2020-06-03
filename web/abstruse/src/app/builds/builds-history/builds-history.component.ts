import { Component, OnInit } from '@angular/core';
import { Build } from '../shared/build.model';
import { BuildsService } from '../shared/builds.service';

@Component({
  selector: 'app-builds-history',
  templateUrl: './builds-history.component.html',
  styleUrls: ['./builds-history.component.sass']
})
export class BuildsHistoryComponent implements OnInit {
  fetchingBuilds: boolean;
  fetchingMore: boolean;
  hideMoreButton: boolean;
  builds: Build[] = [];
  limit = 5;
  offset = 0;

  constructor(
    private buildsService: BuildsService
  ) { }

  ngOnInit(): void {
    this.findBuilds();
  }

  findBuilds(): void {
    if (this.offset === 0) {
      this.fetchingBuilds = true;
    } else {
      this.fetchingMore = true;
    }

    this.buildsService.findBuilds(this.limit, this.offset)
      .subscribe((resp: Build[]) => {
        this.builds = this.builds.concat(resp);
        if (resp.length === this.limit) {
          this.offset += resp.length;
        } else {
          this.hideMoreButton = true;
        }
      }, err => {
        console.error(err);
      }, () => {
        this.fetchingBuilds = false;
        this.fetchingMore = false;
      });
  }
}
